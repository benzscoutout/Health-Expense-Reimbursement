const express = require('express');
const { db, storage } = require('../config/firebase');
const { auth, authHR } = require('../middleware/auth');
const Busboy = require('busboy');
const router = express.Router();
const os = require('os');
const path = require('path');
const fs = require('fs');

// Test route to check if claims router is working (no auth required)
router.get('/test', (req, res) => {
  res.json({ message: 'Claims router is working' });
});

// Test route with auth
router.get('/test-auth', auth, (req, res) => {
  res.json({ 
    message: 'Claims router with auth is working',
    user: req.user 
  });
});

// Debug route to check authentication
router.get('/debug-auth', (req, res) => {
  const authHeader = req.header('Authorization');
  res.json({ 
    message: 'Debug auth info',
    hasAuthHeader: !!authHeader,
    authHeader: authHeader ? authHeader.substring(0, 50) + '...' : null,
    headers: req.headers
  });
});



// Get all claims (HR only)
router.get('/', authHR, async (req, res) => {
  try {
    console.log('Fetching all claims for HR user:', req.user.email);
    
    const claimsRef = db.collection('health_expense');
    const snapshot = await claimsRef.orderBy('submittedDate', 'desc').get();
    
    const claims = [];
    snapshot.forEach(doc => {
      claims.push({
        id: doc.id,
        ...doc.data()
      });
    });

    console.log(`Found ${claims.length} total claims`);
    res.json(claims);
  } catch (error) {
    console.error('Error fetching claims:', error);
    console.error('Error details:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// Get claims by user (Client only)
router.get('/my-claims', auth, async (req, res) => {
  try {
    console.log('User email:', req.user.email);
    console.log('User role:', req.user.role);
    
    const claimsRef = db.collection('health_expense');
    
    // First try without orderBy to avoid index issues
    const snapshot = await claimsRef
      .where('employeeName', '==', req.user.email)
      .get();
    
    const claims = [];
    snapshot.forEach(doc => {
      claims.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Sort in memory instead of using orderBy
    claims.sort((a, b) => new Date(b.submittedDate) - new Date(a.submittedDate));
    
    console.log(`Found ${claims.length} claims for user ${req.user.email}`);
    
    if(claims.length === 0){
      return res.status(200).json([]); // Return empty array instead of 404
    }else{
      return res.status(200).json(claims);
    }

    
  } catch (error) {
    console.error('Error fetching user claims:', error);
    console.error('Error details:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// Submit new claim
router.post('/', auth, async (req, res) => {
  try {
    console.log('Starting file upload with raw body parsing');
    console.log('Request headers:', req.headers);
    console.log('Content-Type:', req.headers['content-type']);

    // Check content type and handle accordingly
    const contentType = req.headers['content-type'] || '';
    
    let vendor, date, total, items;
    
    if (contentType.includes('multipart/form-data')) {
      // Handle multipart data with improved Busboy implementation
      const busboy = Busboy({ headers: req.headers });
      const tmpdir = os.tmpdir();

      const fields = {};
      const fileWrites = [];
      let fileToProcess = {};
      let isInvalidFileType = false;

      busboy.on('field', (fieldname, val) => {
        console.log('Field received:', fieldname, val);
        fields[fieldname] = val;
      });

      busboy.on('file', (fieldname, file, { filename, mimeType }) => {
        console.log('File received:', fieldname, filename, mimeType);
        
        // Validate file type
        const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedImageTypes.includes(mimeType)) {
          isInvalidFileType = true;
          file.resume(); // Continue stream to discard data
          return;
        }

        const filepath = path.join(tmpdir, filename);
        fileToProcess = { fieldname, filepath, filename, mimeType };

        const writeStream = fs.createWriteStream(filepath);
        file.pipe(writeStream);

        const promise = new Promise((resolve, reject) => {
          file.on('end', () => writeStream.end());
          writeStream.on('finish', resolve);
          writeStream.on('error', reject);
        });
        fileWrites.push(promise);
      });

      busboy.on('finish', async () => {
        try {
          // Check for invalid file type
          if (isInvalidFileType) {
            return res.status(415).json({ 
              message: "ประเภทไฟล์ไม่รองรับ กรุณาอัปโหลดเฉพาะไฟล์รูปภาพ (JPEG, PNG, GIF, WEBP)" 
            });
          }

          // Check if file was uploaded
          if (fileWrites.length === 0) {
            return res.status(400).json({ message: "ไม่พบไฟล์ที่อัปโหลด" });
          }

          await Promise.all(fileWrites);

          // Extract form data
          const { vendor, date, total, items } = fields;
          
          if (!vendor || !date || !total) {
            // Clean up uploaded file
            if (fileToProcess.filepath && fs.existsSync(fileToProcess.filepath)) {
              fs.unlinkSync(fileToProcess.filepath);
            }
            return res.status(400).json({ message: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
          }

          console.log('Uploading file to Firebase Storage:', fileToProcess.filename);

          // Read file buffer
          const fileBuffer = fs.readFileSync(fileToProcess.filepath);

          // Upload to Firebase Storage
          const bucket = storage.bucket();
          const storageFileName = `health-expense/${Date.now()}-${fileToProcess.filename}`;
          const file = bucket.file(storageFileName);
          
          // Upload the file
          await file.save(fileBuffer, {
            metadata: {
              contentType: fileToProcess.mimeType,
              cacheControl: 'public, max-age=31536000', // Cache for one year
            },
          });

          // Get the public URL
          await file.makePublic();
          const publicUrl = `https://storage.googleapis.com/${bucket.name}/${storageFileName}`;

          console.log('File uploaded to:', publicUrl);

          // Clean up temporary file
          fs.unlinkSync(fileToProcess.filepath);

          const claimData = {
            employeeName: req.user.email,
            submittedDate: new Date().toISOString().split('T')[0],
            receiptImage: publicUrl,
            receiptData: {
              vendor,
              date,
              total: parseFloat(total),
              items: items ? JSON.parse(items) : []
            },
            status: 'Pending',
            createdAt: new Date()
          };

          const docRef = await db.collection('health_expense').add(claimData);
          
          res.status(201).json({
            message: 'ส่งคำร้องเรียบร้อยแล้ว',
            claimId: docRef.id,
            claim: {
              id: docRef.id,
              ...claimData
            }
          });

        } catch (error) {
          console.error('Error submitting claim:', error);
          // Clean up temporary file on error
          if (fileToProcess.filepath && fs.existsSync(fileToProcess.filepath)) {
            fs.unlinkSync(fileToProcess.filepath);
          }
          res.status(500).json({ message: error.message });
        }
      });

      busboy.on('error', (err) => {
        console.error('Busboy error:', err);
        res.status(400).json({ message: 'เกิดข้อผิดพลาดในการอัปโหลดไฟล์' });
      });

      // Use rawBody for Firebase Functions compatibility
      busboy.end(req.rawBody);
      return; // Exit early for multipart handling
    } else if (contentType.includes('application/json')) {
      // Handle JSON data
      const { vendor: v, date: d, total: t, items: i } = req.body;
      vendor = v;
      date = d;
      total = t;
      items = i;
    } else {
      return res.status(400).json({ message: 'Content-Type must be application/json or multipart/form-data' });
    }
    
    if (!vendor || !date || !total) {
      return res.status(400).json({ message: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
    }

    console.log('Form data received:', { vendor, date, total, items });

    // Create a mock claim without file for now
    const claimData = {
      employeeName: req.user.email,
      submittedDate: new Date().toISOString().split('T')[0],
      receiptImage: 'https://via.placeholder.com/300x200?text=Receipt+Image',
      receiptData: {
        vendor,
        date,
        total: parseFloat(total),
        items: items ? JSON.parse(items) : []
      },
      status: 'Pending',
      createdAt: new Date()
    };

    const docRef = await db.collection('health_expense').add(claimData);
    
    res.status(201).json({
      message: 'ส่งคำร้องเรียบร้อยแล้ว (without file upload for testing)',
      claimId: docRef.id,
      claim: {
        id: docRef.id,
        ...claimData
      }
    });

  } catch (error) {
    console.error('Error submitting claim:', error);
    console.error('Error details:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// Update claim status (HR only)
router.patch('/:claimId', authHR, async (req, res) => {
  try {
    const { claimId } = req.params;
    const { status, feedback } = req.body;

    if (!status || !['Pending', 'Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'สถานะไม่ถูกต้อง' });
    }

    const claimRef = db.collection('health_expense').doc(claimId);
    const claimDoc = await claimRef.get();

    if (!claimDoc.exists) {
      return res.status(404).json({ message: 'ไม่พบคำร้อง' });
    }

    const updateData = {
      status,
      updatedAt: new Date()
    };

    if (feedback) {
      updateData.feedback = feedback;
    }

    await claimRef.update(updateData);

    res.json({
      message: 'อัปเดตคำร้องเรียบร้อยแล้ว',
      claimId,
      status,
      feedback
    });

  } catch (error) {
    console.error('Error updating claim:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get claim by ID
router.get('/:claimId', auth, async (req, res) => {
  try {
    const { claimId } = req.params;
    const claimRef = db.collection('health_expense').doc(claimId);
    const claimDoc = await claimRef.get();

    if (!claimDoc.exists) {
      return res.status(404).json({ message: 'ไม่พบคำร้อง' });
    }

    const claimData = claimDoc.data();

    // Check if user has permission to view this claim
    if (req.user.role !== 'hr' && claimData.employeeName !== req.user.email) {
      return res.status(403).json({ message: 'ไม่มีสิทธิ์เข้าถึงคำร้องนี้' });
    }

    res.json({
      id: claimDoc.id,
      ...claimData
    });

  } catch (error) {
    console.error('Error fetching claim:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 
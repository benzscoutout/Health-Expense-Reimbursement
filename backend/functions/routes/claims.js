const express = require('express');
const { db, storage } = require('../config/firebase');
const { auth, authHR } = require('../middleware/auth');
const Busboy = require('busboy');
const router = express.Router();
const os = require('os');
const path = require('path');
const fs = require('fs');

// Fraud detection helper functions
const fraudDetectionService = {
  // Check for duplicate receipts
  async checkForDuplicates(employeeName, receiptData, receiptImageUrl) {
    try {
      const claimsRef = db.collection('health_expense');
      const snapshot = await claimsRef
        .where('employeeName', '==', employeeName)
        .where('receiptData.vendor', '==', receiptData.vendor)
        .where('receiptData.total', '==', receiptData.total)
        .get();

      const duplicates = [];
      snapshot.forEach(doc => {
        const claim = doc.data();
        // Check if same date or very close dates
        const claimDate = new Date(claim.receiptData.date);
        const newDate = new Date(receiptData.date);
        const daysDiff = Math.abs((claimDate - newDate) / (1000 * 60 * 60 * 24));
        
        if (daysDiff <= 7) { // Within 7 days
          duplicates.push({
            claimId: doc.id,
            similarityScore: 0.9,
            reason: 'ร้านค้า จำนวนเงิน และช่วงวันที่เดียวกัน'
          });
        }
      });

      return {
        isDuplicate: duplicates.length > 0,
        similarClaims: duplicates
      };
    } catch (error) {
      console.error('Error checking for duplicates:', error);
      return { isDuplicate: false, similarClaims: [] };
    }
  },

  // Validate amount for suspicious patterns
  validateAmount(amount, vendor) {
    const fraudIndicators = [];
    
    // Check for round numbers (suspicious)
    if (amount % 1000 === 0 && amount > 1000) {
      fraudIndicators.push({
        type: 'suspicious_pattern',
        severity: 'medium',
        description: 'จำนวนเงินกลมอาจน่าสงสัย',
        confidence: 0.7,
        detectedAt: new Date().toISOString()
      });
    }

    // Check for unusually high amounts
    if (amount > 50000) {
      fraudIndicators.push({
        type: 'unusual_amount',
        severity: 'high',
        description: 'จำนวนเงินเกินขีดจำกัดค่าใช้จ่ายด้านสุขภาพทั่วไป',
        confidence: 0.8,
        detectedAt: new Date().toISOString()
      });
    }

    // Check for very small amounts (might be fake)
    if (amount < 100) {
      fraudIndicators.push({
        type: 'suspicious_pattern',
        severity: 'low',
        description: 'จำนวนเงินน้อยมากอาจน่าสงสัย',
        confidence: 0.5,
        detectedAt: new Date().toISOString()
      });
    }

    return fraudIndicators;
  },

  // Validate date for anomalies
  validateDate(date) {
    const fraudIndicators = [];
    const claimDate = new Date(date);
    const today = new Date();
    
    // Check for future dates
    if (claimDate > today) {
      fraudIndicators.push({
        type: 'date_anomaly',
        severity: 'high',
        description: 'วันที่ใบเสร็จอยู่ในอนาคต',
        confidence: 0.9,
        detectedAt: new Date().toISOString()
      });
    }

    // Check for very old dates (more than 1 year)
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    if (claimDate < oneYearAgo) {
      fraudIndicators.push({
        type: 'date_anomaly',
        severity: 'medium',
        description: 'วันที่ใบเสร็จเก่าเกินไป',
        confidence: 0.7,
        detectedAt: new Date().toISOString()
      });
    }

    return fraudIndicators;
  },

  // Calculate overall fraud risk level
  calculateRiskLevel(fraudIndicators) {
    if (!fraudIndicators || fraudIndicators.length === 0) {
      return 'low';
    }

    const highSeverityCount = fraudIndicators.filter(i => i.severity === 'high').length;
    const mediumSeverityCount = fraudIndicators.filter(i => i.severity === 'medium').length;

    if (highSeverityCount > 0) return 'high';
    if (mediumSeverityCount > 1) return 'high';
    if (mediumSeverityCount > 0) return 'medium';
    return 'low';
  },

  // Calculate authenticity score
  calculateAuthenticityScore(fraudIndicators) {
    if (!fraudIndicators || fraudIndicators.length === 0) {
      return 1.0;
    }

    let totalPenalty = 0;
    fraudIndicators.forEach(indicator => {
      const severityMultiplier = {
        'low': 0.1,
        'medium': 0.3,
        'high': 0.5
      };
      totalPenalty += indicator.confidence * severityMultiplier[indicator.severity];
    });

    return Math.max(0, 1 - totalPenalty);
  }
};

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

// Submit new claim with fraud detection
router.post('/', auth, async (req, res) => {
  try {
    console.log('Starting file upload with fraud detection');
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

          // Prepare receipt data
          const receiptData = {
            vendor,
            date,
            total: parseFloat(total),
            items: items ? JSON.parse(items) : []
          };

          // Perform fraud detection
          console.log('Performing fraud detection...');
          
          // Check for duplicates
          const duplicateCheck = await fraudDetectionService.checkForDuplicates(
            req.user.email, 
            receiptData, 
            publicUrl
          );

          // Validate amount
          const amountFraudIndicators = fraudDetectionService.validateAmount(
            receiptData.total, 
            receiptData.vendor
          );

          // Validate date
          const dateFraudIndicators = fraudDetectionService.validateDate(receiptData.date);

          // Combine all fraud indicators
          const allFraudIndicators = [
            ...amountFraudIndicators,
            ...dateFraudIndicators
          ];

          // Calculate risk level and authenticity score
          const fraudRiskLevel = fraudDetectionService.calculateRiskLevel(allFraudIndicators);
          const authenticityScore = fraudDetectionService.calculateAuthenticityScore(allFraudIndicators);

          // Determine initial status based on fraud detection
          let initialStatus = 'Pending';
          if (fraudRiskLevel === 'high') {
            initialStatus = 'Flagged';
          } else if (fraudRiskLevel === 'medium') {
            initialStatus = 'UnderReview';
          }

          const claimData = {
            employeeName: req.user.email,
            submittedDate: new Date().toISOString().split('T')[0],
            receiptImage: publicUrl,
            receiptData,
            status: initialStatus,
            createdAt: new Date(),
            // Fraud detection data
            fraudIndicators: allFraudIndicators,
            authenticityScore,
            fraudRiskLevel,
            duplicateCheck
          };

          const docRef = await db.collection('health_expense').add(claimData);
          
          res.status(201).json({
            message: 'ส่งคำร้องเรียบร้อยแล้ว',
            claimId: docRef.id,
            claim: {
              id: docRef.id,
              ...claimData
            },
            fraudDetection: {
              riskLevel: fraudRiskLevel,
              authenticityScore,
              indicators: allFraudIndicators.length,
              isDuplicate: duplicateCheck.isDuplicate
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

// Update claim status (HR only) with fraud handling
router.patch('/:claimId', authHR, async (req, res) => {
  try {
    const { claimId } = req.params;
    const { status, feedback, investigationNotes } = req.body;

    if (!status || !['Pending', 'Approved', 'Rejected', 'Flagged', 'UnderReview'].includes(status)) {
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

    // Handle fraud-related updates
    if (status === 'Flagged') {
      updateData.flaggedBy = req.user.email;
      updateData.flaggedAt = new Date().toISOString();
    }

    if (investigationNotes) {
      updateData.investigationNotes = investigationNotes;
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
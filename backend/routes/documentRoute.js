import express from 'express';

import {
  uploadDocument,
  getDocuments,
  getDocument,
  deleteDocument,
  updateDocument,
} from '../controllers/documentController.js';

import { protect } from '../middleware/auth.js';
import { upload } from '../config/multer.js';

const router = express.Router();
router.post('/upload', upload.single('file'), protect, uploadDocument);

// Other routes still protected
router.get('/', protect, getDocuments);
router.get('/:id', protect, getDocument);
router.delete('/:id', protect, deleteDocument);
router.put('/:id', protect, updateDocument);

export default router;
import express from 'express';
import { getVtonResult, saveVtonResult, deleteVtonResult, getUserVtonResults } from '../controllers/vtonResultController.js';

const router = express.Router();

router.post('/get', getVtonResult);
router.post('/delete', deleteVtonResult);
router.post('/get-user', getUserVtonResults);

export default router;

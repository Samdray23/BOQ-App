import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { constructionStageController } from './construction-stage.controller.js';

const router = Router();

router.use(authenticate);

router.get('/', constructionStageController.getAllStages);
router.get('/boq/:boqId', constructionStageController.getBoqBreakdown);
router.get('/:stageId/boq/:boqId', constructionStageController.getStageSummary);

export default router;

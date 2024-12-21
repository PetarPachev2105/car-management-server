import Router from 'express-promise-router';

import MaintenanceController from './maintenance.controller';

const router = Router();

/** GETS */
router
    .route('/:maintenanceId')
    .get(MaintenanceController.getMaintenance)

router
    .route('/')
    .get(MaintenanceController.searchMaintenance)

router
    .route('/monthlyRequestsReport')
    .get(MaintenanceController.monthlyRequestsReport)

/** POSTS */
router
    .route('/')
    .post(MaintenanceController.createMaintenance)

/** PUTS */
router
    .route('/:maintenanceId')
    .put(MaintenanceController.updateMaintenance)

/** DELETES */
router
    .route('/:maintenanceId')
    .delete(MaintenanceController.deleteMaintenance)

export default router;
import { Router } from "express";
import { PERMISSIONS } from "src/constants/permissions.js";
import { ROLES } from "src/constants/roles.js";
import { userController } from "src/controllers/index.js";
import { validateSchema } from "src/middlewares/custom/validateSchema.js";
import authMiddleware from "src/middlewares/user/authMiddleware.js";
import checkPermission from "src/middlewares/user/checkPermission.js";
import checkRole from "src/middlewares/user/checkRole.js";
import { assignRoleSchema, updateUserSchema } from "src/validators/index.js";
const router = Router();


router.use(authMiddleware);
//Manage Permissions and Assign Roles
router.get("/roles-permissions", userController.getRolesAndPermissions);

router.get("/", checkRole(ROLES.ADMIN, ROLES.MANAGER, ROLES.STUDENT), checkPermission(PERMISSIONS.USERS_READ), userController.getAllUsers);
router.get("/:id", checkRole(ROLES.ADMIN, ROLES.MANAGER, ROLES.SUPPORT), checkPermission(PERMISSIONS.USER_READ), userController.getUserById);
router.put("/:id", validateSchema(updateUserSchema), checkRole(ROLES.ADMIN, ROLES.MANAGER), checkPermission(PERMISSIONS.USER_UPDATE), userController.updateUserById);
router.delete("/:id", checkRole(ROLES.ADMIN, ROLES.MANAGER), checkPermission(PERMISSIONS.USER_DELETE), userController.deleteUserById);




export default router;
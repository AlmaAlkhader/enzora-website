import { Router, type IRouter } from "express";
import healthRouter from "./health";
import ordersRouter from "./orders";
import adminRouter from "./admin";
import socialLinksRouter from "./social-links";
import productsRouter from "./products";
import paymentMethodsRouter from "./payment-methods";

const router: IRouter = Router();

router.use(healthRouter);
router.use(ordersRouter);
router.use(adminRouter);
router.use(socialLinksRouter);
router.use(productsRouter);
router.use(paymentMethodsRouter);

export default router;

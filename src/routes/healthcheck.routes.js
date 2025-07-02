import { Router } from "express";

import { healthChecker } from "../controlllers/healthcheck.controller.js";

const router = Router()
///api/v1/healthcheck/test

router.route("/").get(healthChecker)
router.route("test").get(healthChecker)

export default router
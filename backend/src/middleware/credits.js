import User from "../models/User.js";

// Keep these in sync with COSTS in the frontend's CreditsContext.jsx
export const COSTS = { generate: 5, analyze: 2, test: 3 };

export const charge = (action) => async (req, res, next) => {
  try {
    const cost = COSTS[action];
    const user = await User.findOneAndUpdate(
      { _id: req.userId, credits: { $gte: cost } },
      { $inc: { credits: -cost } },
      { new: true }
    );

    if (!user) {
      const current = await User.findById(req.userId).select("credits");
      return res.status(402).json({
        message: `Not enough credits. This needs ${cost}, you have ${current?.credits ?? 0}.`,
      });
    }

    req.credits = { used: cost, remaining: user.credits };
    next();
  } catch (err) {
    console.error("[charge]", err);
    res.status(500).json({ message: "Could not process credits" });
  }
};

export const refund = (req) =>
  User.updateOne({ _id: req.userId }, { $inc: { credits: req.credits.used } });
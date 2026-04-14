import User from "../models/user.js";

export const getProfile = async (req, res) => {
  const { username } = req.params;

  const user = await User.findOne({ username }).select('-password -tempPassword');

  if (!user) return res.status(404).json({ error: "User not found" });

  res.json({
    user,
    role: user.role
  });
};

export const updateProfile = async (req, res) => {
  const { username } = req.params;
  const { about } = req.body;

  const updatedUser = await User.findOneAndUpdate(
    { username },
    { about },
    { new: true }
  ).select('-password -tempPassword');

  res.json({ message: "Profile updated", user: updatedUser });
};
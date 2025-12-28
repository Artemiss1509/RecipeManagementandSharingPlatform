import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_SECRET, JWT_EXPIRY } from "../utils/env.js";

export const signUp = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const checkEmail = await User.findOne({ where: { email } });
        const checkUsername = await User.findOne({ where: { username: name } });

        if (checkUsername) {
            return res.status(400).json({ message: "Username already exists. Please choose a different username." });
        }
        if (checkEmail) {
            return res.status(400).json({ message: "Email already exists. Please use a different email." });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({
            username: name,
            email,
            password: hashedPassword,
        })

        res.status(201).json({ message: "User created successfully", user: newUser });

    } catch (error) {
        res.status(500).json({ message: "User not created. Sign-up error", error: error.message });
    }
}

export const signIn = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(404).json({ message: "Email not found. Please sign up first." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid password. Please try again." });
        }
        const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: JWT_EXPIRY });

        res.status(200).json({ message: "Sign-in successful", user, token });
    } catch (error) {
        res.status(500).json({ message: "Sign-in error", error: error.message });
    }
}

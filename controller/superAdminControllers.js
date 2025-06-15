import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export const createSuperAdmin = async (req, res) => {
    try {
        const { fullName, email, password } = req.body;
        const existingAdmin = await SuperAdminModel.find({ email: email });
        if (existingAdmin.length > 0) {
            return res.status(400).send({
                success: false,
                message: "Super admin already exists with this email"
            });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newSuperAdmin = new SuperAdminModel({
            fullName: fullName,
            email: email,
            password: hashedPassword
        });
        await newSuperAdmin.save();
        res.status(201).send({
            success: true,
            message: "Super admin created successfully",
            data: newSuperAdmin
        });

    } catch (error) {
        res.status(500).send({
            success: false,
            message: "Error in creating super admin",
            error: error.message
        });
    }
}

export const loginSuperAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const superAdminData = await SuperAdminModel.find({ email });
        if (superAdminData.length === 0) {
            return res.status(404).send({
                success: false,
                message: "Super admin not found"
            });
        }
        const isMatch = await bcrypt.compare(password, superAdminData[0].password);
        if (!isMatch) {
            return res.status(401).send({
                success: false,
                message: 'Super admin credentials do not match'
            });
        }
        const token = jwt.sign({ id: superAdminData._id, role: superAdminData.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
        res.status(200).send({
            success: true,
            message: "Super admin logged in successfully",
            data: { token, superAdminData: superAdminData[0] }
        });

    } catch (error) {
        res.status(500).send({
            success: false,
            message: "Error in logging in super admin",
            error: error.message
        });

    }
}


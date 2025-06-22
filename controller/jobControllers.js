import JobModel from "../models/jobModel.js";

export const createJob = async (req, res) => {
    try {
        const { title, description, company, location, adminId, openings, salaryRange, jobType, experienceRequired, skillsRequired, industry, category, deadline, workMode } = req.body;
        const job = new JobModel({
            title,
            adminId,
            description,
            company,
            location,
            openings,
            salaryRange,
            jobType,
            experienceRequired,
            skillsRequired: skillsRequired, // Convert comma-separated string to array
            industry,
            category,
            deadline,
            workMode
        });
        await job.save();
        res.status(201).send({
            success: true,
            message: "Job created successfully",
            data: job
        });
    } catch (error) {
        res.status(500).send({
            success: false,
            message: "Error in creating job",
            error: error.message
        });

    }
}

export const getAllJobs = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;       // Default page 1
        const limit = parseInt(req.query.limit) || 10;    // Default 10 jobs per page
        const skip = (page - 1) * limit;

        const total = await JobModel.countDocuments(); // Total number of jobs

        const jobs = await JobModel.find({})
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        if (jobs.length === 0) {
            return res.status(404).send({
                success: false,
                message: "No jobs found"
            });
        }

        res.status(200).send({
            success: true,
            message: "Jobs fetched successfully",
            data: jobs,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit),
                limit,
            },
        });

    } catch (error) {
        res.status(500).send({
            success: false,
            message: "Error in getting jobs",
            error: error.message,
        });
    }
};

export const getJobById = async (req, res) => {
    try {
        const id = req.params.id;
        const job = await JobModel.findById(id);
        if (!job) {
            res.status(404)
                .send({
                    success: false,
                    message: "job not found"
                })
        }
        res.status(200)
            .send({
                success: true,
                message: "job find successfully",
                data: job
            })
    } catch (error) {
        res.status(500)
            .send({
                success: false,
                message: "error in getting job by id",
                error: error.message
            });
    }
}

export const deleteJobById = async (req, res) => {
    try {
        const id = req.params.id;
        const job = await JobModel.findByIdAndDelete(id);
        if (!job) {
            res.status(404)
                .send({
                    success: false,
                    message: " job not found"
                })
        }
        res.status(200)
            .send({
                success: true,
                message: " job deleted successfully",
                data: job
            })
    } catch (error) {
        res.status(500)
            .send({
                success: false,
                message: "error in deleting job",
                error: error.message
            })
    }
}

export const updateJobById = async (req, res) => {
    try {
        const id = req.params.id;
        const {
            title,
            description,
            company,
            location,
            salary,
            openings,
            salaryRange,
            jobType,
            experienceRequired,
            skillsRequired,
            industry,
            category,
            status,
            workMode,
            deadline,
        } = req.body;

        const job = await JobModel.findByIdAndUpdate(
            id,
            {
                title,
                description,
                company,
                location,
                salary,
                openings,
                salaryRange,
                jobType,
                experienceRequired,
                skillsRequired,
                industry,
                category,
                status,
                workMode,
                deadline,
            },
            { new: true }
        );

        if (!job) {
            return res.status(404).send({
                success: false,
                message: "Job not found",
            });
        }

        res.status(200).send({
            success: true,
            message: "Job updated successfully",
            data: job,
        });
    } catch (error) {
        res.status(500).send({
            success: false,
            message: "Error in updating job",
            error: error.message,
        });
    }
};


export const getJobsByAdminId = async (req, res) => {
    try {
        const adminId = req.params.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Total count without pagination or sorting
        const total = await JobModel.countDocuments({ adminId });

        // Get paginated & sorted jobs
        const jobs = await JobModel.find({ adminId })
            .sort({ createdAt: -1 }) // Sort newest first
            .skip(skip)
            .limit(limit);

        if (jobs.length === 0) {
            return res.status(404).send({
                success: false,
                message: "No jobs found for this admin"
            });
        }

        res.status(200).send({
            success: true,
            message: "Jobs fetched successfully",
            data: jobs,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit),
                limit
            }
        });

    } catch (error) {
        res.status(500).send({
            success: false,
            message: "Error in getting jobs by admin ID",
            error: error.message
        });
    }
};

// job count 
export const getJobCountByAdmin = async (req, res) => {
    try {
        const adminId = req.params.id;
        const count = await JobModel.countDocuments({ adminId });

        res.status(200).send({
            success: true,
            message: "Job count retrieved successfully",
            count: count
        });
    } catch (error) {
        res.status(500).send({
            success: false,
            message: "Error in getting job count",
            error: error.message
        });
    }
};


// filter jobs by title, location, and job type
export const filterJobs = async (req, res) => {
    try {
        const { title, location, jobType, experienceRequired, skillsRequired, } = req.query;
        const filter = {};

        if (title) {
            filter.title = { $regex: title, $options: 'i' }; // Case-insensitive search
        }
        if (location) {
            filter.location = { $regex: location, $options: 'i' };
        }
        if (jobType) {
            filter.jobType = jobType;
        }
        if (experienceRequired) {
            filter.experienceRequired = experienceRequired;
        }
        if (skillsRequired) {
            filter.skillsRequired = { $in: skillsRequired.split(',').map(skill => skill.trim()) };
        }



        const jobs = await JobModel.find(filter).sort({ createdAt: -1 });

        if (jobs.length === 0) {
            return res.status(404).send({
                success: false,
                message: "No jobs found matching the criteria"
            });
        }

        res.status(200).send({
            success: true,
            message: "Jobs filtered successfully",
            data: jobs
        });

    } catch (error) {
        res.status(500).send({
            success: false,
            message: "Error in filtering jobs",
            error: error.message
        });
    }
};

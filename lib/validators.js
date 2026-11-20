import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(60),
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(100),
  role: z.enum(['jobseeker', 'employer'], {
    errorMap: () => ({ message: 'Please select a role' }),
  }),
  companyName: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const jobPostSchema = z.object({
  title: z.string().min(3, 'Job title is required').max(120),
  category: z.string().min(1, 'Category is required'),
  jobType: z.enum(['Full-time', 'Part-time', 'Internship', 'Contract', 'Freelance']),
  workMode: z.enum(['Remote', 'Hybrid', 'On-site']),
  location: z.string().min(1, 'Location is required'),
  description: z.string().min(20, 'Please provide a detailed description'),
  responsibilities: z.array(z.string()).default([]),
  requirements: z.array(z.string()).default([]),
  skills: z.array(z.string()).min(1, 'Please add at least 1 skill'),
  salaryMin: z.coerce.number().min(0).default(0),
  salaryMax: z.coerce.number().min(0).default(0),
  salaryCurrency: z.string().default('INR'),
  salaryType: z.enum(['monthly', 'yearly', 'stipend']).default('yearly'),
  experienceLevel: z.enum(['Fresher', '1-3', '3-5', '5+']),
  openings: z.coerce.number().min(1).default(1),
  deadline: z.string().min(1, 'Application deadline is required'),
  status: z.enum(['Draft', 'Active', 'Closed', 'Pending', 'Rejected']).default('Active'),
});

export const applySchema = z.object({
  jobId: z.string().min(1, 'Job ID is required'),
  resumeUrl: z.string().min(1, 'Please provide or select a resume'),
  coverLetter: z.string().max(3000).optional(),
});

export const profileUpdateSchema = z.object({
  headline: z.string().max(120).optional(),
  about: z.string().max(2000).optional(),
  skills: z.array(z.string()).optional(),
  experience: z
    .array(
      z.object({
        title: z.string(),
        company: z.string(),
        from: z.string(),
        to: z.string(),
        description: z.string().optional(),
      })
    )
    .optional(),
  education: z
    .array(
      z.object({
        degree: z.string(),
        institute: z.string(),
        year: z.string(),
      })
    )
    .optional(),
  expectedSalary: z.coerce.number().optional(),
  preferredLocation: z.string().optional(),
  links: z
    .object({
      github: z.string().optional(),
      linkedin: z.string().optional(),
      portfolio: z.string().optional(),
    })
    .optional(),
});

export const companyUpdateSchema = z.object({
  name: z.string().min(2, 'Company name is required'),
  logo: z.string().optional(),
  website: z.string().optional(),
  industry: z.string().optional(),
  size: z.enum(['1-10', '11-50', '51-200', '201-500', '500+']).optional(),
  about: z.string().max(3000).optional(),
  location: z.string().optional(),
});

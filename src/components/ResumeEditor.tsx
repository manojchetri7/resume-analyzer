import React from 'react';
import { ResumeBuilder } from './ResumeBuilder';

// Re-export ResumeBuilder as ResumeEditor for unified developer API and backwards-compatibility
export const ResumeEditor = ResumeBuilder;
export default ResumeBuilder;

const StopTranscodingsJob = require('./StopTranscodingsJob.js');
const MovieJob = require('./MovieJob.js');

class JobHandler {
    constructor() {
        this.jobs = [
            new StopTranscodingsJob(2000),
            new MovieJob(43200000, true) // 12 hours
        ]
    }

    startAllJobs() {
        for (const job of this.jobs) {
            job.startJob();
        }
    }
}

module.exports = JobHandler;
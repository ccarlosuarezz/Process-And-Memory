class Process {

    constructor(id, size, time, state) {
        this.id = id;
        this.size = size;
        this.time = time;
        this.state = state;
    }

    createProcessPaging(frameSize) {
        let pages = [];
        let processDivision = Math.ceil(this.size/frameSize);
        let actualSize = this.size;
        for (let i = 0; i < processDivision; i++) {
            pages.push({idPage: i+1, size: actualSize>frameSize? frameSize: actualSize, isInPrincipalMemory: false});
            actualSize -= frameSize;
        }
        return pages;
    }
}
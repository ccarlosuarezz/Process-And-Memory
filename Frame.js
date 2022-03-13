class Frame {

    constructor(id, size, process='Ninguno') {
        this.id = id;
        this.size = size;
        this.process = process;
        this.occupiedSpace = 0;
    }

    getFreeSpace() {
        return this.size - this.occupiedSpace;
    }
}
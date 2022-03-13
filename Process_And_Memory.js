const inputProcessQuantity = document.getElementById('process_quantity');
const processTable = document.getElementById('process_list');
const principalMemoryTable = document.getElementById('principal_memory');
const virtualMemoryTable = document.getElementById('virtual_memory');
const body = document.getElementById('body');

const execButton = document.getElementById('exec_button');

const COLOR_CREATED = '#5ACDFE';
const COLOR_READY = '#FFFA4D';
const COLOR_EXECUTING = '#00D455';
const COLOR_WAITING_CPU = '#FF2626';
const COLOR_WAITING_IO = '#F76E11';
const COLOR_RECEIVING_IO = '#00EAD3';
const COLOR_TERMINATED = '#D1D1D1';

const PRINCIPAL_MEMORY_SIZE = 256;//MB
const VIRTUAL_MEMORY_SIZE = 512;//MB
const FRAME_SIZE = 16;//MB

let stateList = [
    {id: 1, name: 'Created', color: COLOR_CREATED},
    {id: 2, name: 'Ready', color: COLOR_READY},
    {id: 3, name: 'Executing', color: COLOR_EXECUTING},
    {id: 4, name: 'Waiting CPU', color: COLOR_WAITING_CPU},
    {id: 5, name: 'Waiting I/O', color: COLOR_WAITING_IO},
    {id: 6, name: 'Receiving I/O', color: COLOR_RECEIVING_IO},
    {id: 7, name: 'Terminated', color: COLOR_TERMINATED}];

let processList = [];
let frameListPrincipalMemory = [];
let frameListVirtualMemory = [];

execButton.addEventListener('click', simulate);

function memoryPagination() {
    fillPrincipalMemoryTable();
    fillVirtualMemoryTable();
}

function fillPrincipalMemoryTable() {
    principalMemoryTable.innerHTML = '';
    for (let i = 0; i < Math.floor(PRINCIPAL_MEMORY_SIZE/FRAME_SIZE); i++) {
        let newFrame = new Frame(i+1, FRAME_SIZE);
        frameListPrincipalMemory.push(newFrame);
        showFrames(principalMemoryTable, newFrame.id, newFrame.process, newFrame.occupiedSpace, newFrame.getFreeSpace());
    }
}

function fillVirtualMemoryTable() {
    virtualMemoryTable.innerHTML = '';
    for (let i = 0; i < Math.floor(VIRTUAL_MEMORY_SIZE/FRAME_SIZE); i++) {
        let newFrame = new Frame(i+1, FRAME_SIZE);
        frameListVirtualMemory.push(newFrame);
        showFrames(virtualMemoryTable, newFrame.id, newFrame.process, newFrame.occupiedSpace, newFrame.getFreeSpace());
    }
}

function refreshPrincipalMemoryTable() {
    principalMemoryTable.innerHTML = '';
    for (let i = 0; i < frameListPrincipalMemory.length; i++) {
        let frame = frameListPrincipalMemory[i];
        showFrames(principalMemoryTable, frame.id, frame.process, frame.occupiedSpace, frame.getFreeSpace());
    }
}

function refreshVirtualMemoryTable() {
    virtualMemoryTable.innerHTML = '';
    for (let i = 0; i < frameListVirtualMemory.length; i++) {
        let frame = frameListVirtualMemory[i];
        showFrames(virtualMemoryTable, frame.id, frame.process, frame.occupiedSpace, frame.getFreeSpace());
    }
}

memoryPagination();

function simulate() {
    if (inputProcessQuantity.value) {
        let numberOfProcesses = inputProcessQuantity.value;
        createProcesses(numberOfProcesses);
        processTable.innerHTML = '';
        fillProcessesTable(processList);

        allocateProcessesInMemory();
        refreshPrincipalMemoryTable();
        refreshVirtualMemoryTable();

        runProcesses();
    } else {
        window.alert('Aun no ha ingresado una cantidad de procesos');
    }
}

function createProcesses(numberOfProcesses) {
    processList = [];
    for (let i = 0; i < numberOfProcesses; i++) {
        processList.push(new Process(i+1, generatePseudoRandom(1, 100), generatePseudoRandom(3, 21), stateList[0]));
    }
}

function generatePseudoRandom(minSec, maxSec) {
    return Math.round(Math.random() * (maxSec - minSec)) + minSec;
}

function fillProcessesTable() {
    for (let i = 0; i < processList.length; i++) {
        let actualProces = processList[i];
        showNewProcess(actualProces.id, actualProces.size, actualProces.time, actualProces.state);
    }
}

function showNewProcess(process, size, time, state) {
    const newRow = document.createElement('tr');
    const tdProcess = document.createElement('td');
    const tdSize = document.createElement('td');
    const tdTime = document.createElement('td');
    const tdState = document.createElement('td');
    newRow.style.background = state.color;
    tdProcess.textContent = 'P'+process;
    tdSize.textContent = size;
    tdTime.textContent = time;
    tdState.textContent = state.name;
    newRow.appendChild(tdProcess);
    newRow.appendChild(tdSize);
    newRow.appendChild(tdTime);
    newRow.appendChild(tdState);
    processTable.appendChild(newRow);
}

function showFrames(memoryTable, frame, process, occupiedSpace, freeSpace) {
    const newRow = document.createElement('tr');
    const tdFrame = document.createElement('td');
    const tdProcess = document.createElement('td');
    const tdOccupiedSpace = document.createElement('td');
    const tdFreeSpace = document.createElement('td');
    tdFrame.textContent = 'M'+frame;
    tdProcess.textContent = process;
    tdOccupiedSpace.textContent = occupiedSpace;
    tdFreeSpace.textContent = freeSpace;
    newRow.appendChild(tdFrame);
    newRow.appendChild(tdProcess);
    newRow.appendChild(tdOccupiedSpace);
    newRow.appendChild(tdFreeSpace);
    memoryTable.appendChild(newRow);
}

function allocateProcessesInMemory() {
    let isPrincipalMemoryFull = false;
    let isVirtualMemoryFull = false;
    for (let i = 0; i < processList.length  ; i++) {
        let processPages = processList[i].createProcessPaging(FRAME_SIZE);
        for (let j = 0; j < processPages.length; j++) {
            if (!isPrincipalMemoryFull) {
                for (let k = 0; k < frameListPrincipalMemory.length; k++) {
                    if (frameListPrincipalMemory[k].occupiedSpace == 0) {
                        frameListPrincipalMemory[k].process = `P${processList[i].id} - ${processPages[j].idPage}`;
                        frameListPrincipalMemory[k].occupiedSpace = processPages[j].size;
                        processPages[j].isInPrincipalMemory = true;
                        break;
                    }
                    if (k == frameListPrincipalMemory.length-1) {
                        isPrincipalMemoryFull = true;
                    }
                }
            }
            if (isPrincipalMemoryFull && !isVirtualMemoryFull) {
                for (let k = 0; k < frameListVirtualMemory.length; k++) {
                    if (frameListVirtualMemory[k].occupiedSpace == 0) {
                        frameListVirtualMemory[k].process = `P${processList[i].id} - ${processPages[j].idPage}`;
                        frameListVirtualMemory[k].occupiedSpace = processPages[j].size;
                        processPages[j].isInPrincipalMemory = false;
                        break;
                    }
                    if (k == frameListVirtualMemory.length-1) {
                        isVirtualMemoryFull = true;
                    }
                }
            }
            if (isVirtualMemoryFull) {
                body.innerHTML = '';
                body.style.background = '#0E3EDA'
            }
        }
    }
}

function runProcesses() {

}
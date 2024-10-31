import { Class, Student, Teacher, Madrich } from './script.js';

function createClass() {
    let nClass = document.getElementById("newClass").value;
    let nStudents = document.getElementById("students").value.split(',');
    let nTeacher = document.getElementById("teacher").value;
    let nMadrich = document.getElementById("madrich").value.split(',');

    const students = nStudents.map(name => {
        const [fname, lname] = name.trim().split(' ');
        return new Student(fname, lname, []);
    });

    const teacherName = nTeacher.split(' ');
    const teacher = new Teacher(teacherName[0], teacherName[1], []);

    const madrich = nMadrich.map(name => {
        const [fname, lname] = name.trim().split(' ');
        return new Madrich(fname, lname, []);
    });

    const newClass = new Class(teacher, students, [], madrich);
    console.log(newClass);
}

// Attach createClass to the global window object
window.createClass = createClass;

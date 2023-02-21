const mysql = require('mysql');
const inquirer = require('inquirer');

let bridge = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password:'password',
    database: 'employee_tracker_db'
});
const mainQuestion=
{
    name: 'action',
    type: 'list',
    message: 'What would you like to do?',
    choices: [
        'View All Employees',
        'Add Employee',
        'Update Employee Role',
        'View All Roles',
        'Add Role',
        'View All Departments',
        'Add Department',
        'Quit'
    ]
};
function viewEmployees(){

    bridge.query(`SELECT * FROM employee`, (err, result) => {
        
        console.log("Viewing Employees:");
        console.table(result);
        main();
    });
}
function addEmployee(){
        bridge.query(`SELECT * FROM  role`, (err, role) => {
        if (err) throw err;


        inquirer.prompt([
            {
                type: 'input',
                name: 'firstName',
                message: 'What is the employees first name?',
            },
            {
                type: 'input',
                name: 'lastName',
                message: 'What is the employees last name?',
            },
            {
                type: 'list',
                name: 'role',
                message: 'What is the employees role?',
                choices: () => {
                    var array = [];
                    for (var x = 0; x < role.length; x++) {
                        array.push(role[x].title);
                    }
                    var newArray = [...new Set(array)];
                    return newArray;
                }
            },
            {
                type: 'input',
                name: 'manager',
                message: 'Who is the employees manager?',
            }
        ]).then((answers) => {
            // Comparing the result and storing it into the variable
            for (var i = 0; i < role.length; i++) {
                if (role[i].title === answers.role) {
                    var roleData = role[i];
                }
            }

            bridge.query(`INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)`, [answers.firstName, answers.lastName, roleData.id, answers.manager], (err, result) => {
                if (err) throw err;
                console.log(`Added employee to the database.`)
                main();
            });
        })
    });

}
function updateEmployee(){
    bridge.query(`SELECT * FROM employee`, (err, employees) => {
        bridge.query(`SELECT * FROM role`, (err, roles) => {
            inquirer.prompt([
                {
                    type: 'list',
                    name: 'employeeEntry',
                    message: 'Who has had a role change?',
                    choices: () => {
                        var array = [];
                        for (var x = 0; x < employees.length; x++) {
                            array.push(employees[x].last_name);
                        }
                        var employeeArray = [...new Set(array)];
                        return employeeArray;
                    }
                },
                {
                    type: 'list',
                    name: 'newRole',
                    message: 'What is their new role?',
                    choices: () => {
                        var array = [];
                        for (var x = 0; x < roles.length; x++) {
                            array.push(roles[x].title);
                        }
                        var newArray = [...new Set(array)];
                        return newArray;
                    }
                }]).then((responses)=> {
                    for (var x = 0; x < employees.length; x++) {
                        if (employees[x].last_name == responses.employeeEntry) {
                            var employeeID = employees[x].id;

                        }
                    }
                    console.log(roles);
                    for (var x = 0; x < roles.length; x++) {
                        if (roles[x].title === responses.newRole) {
                            console.log("updating");
                            
                            var role = roles[x].id;
                        }
                    }
                    console.log(role+"   " + employeeID)
                    bridge.query(`UPDATE employee SET ? WHERE ?`, [{role_id: role}, {id: employeeID}], (err, result) => {
                        if (err) throw err;
                        console.log(`Updated role in the database.`)
                        main();
                    });


                })
        })
    })

}
function viewRoles(){bridge.query(`SELECT * FROM role`, (err, result) => {
    if (err) throw err;
    console.log("Viewing Roles:");
    console.table(result);
    main();
});}
function addRole(){
    bridge.query(`SELECT * FROM department`, (err, departments) => {
    let newRole= inquirer.prompt([
        {
            name: 'roleName',
            type: 'input',
            message: 'Enter the name of the new role:'
        },
        {
            type: 'input',
            name: 'salary',
            message: 'What is the salary of the role:',
        }, 
        {
        type: 'list',
        name: 'department',
        message: 'Which department does the role belong to?',
        choices: () => {
            var array = [];
            for (var x = 0; x < departments.length; x++) {
                console.log(departments[x]);
                array.push(departments[x].department_name);
            }
            console.log(array);
            console.log("out of loop");
            return array;
        }
        }

    ]).then((response)=>{
        console.log(response.department);
        for (var x = 0; x< departments.length; x++) {
            if (departments[x].department_name == response.department) {
                var department = departments[x];
            }
        }
        bridge.query("INSERT INTO role SET ?", {
            title: response.roleName,
            salary: response.salary,
            department_id: department.id
        })
        console.log("role added");
        main();
}
)})}
function viewDepartments(){
    bridge.query(`SELECT * FROM department`, (err, result) => {
        if (err) throw err;
        console.log("Viewing Departments:");
        console.table(result);
        main();
    });
}
function addDepartment(){
    let newDepName= inquirer.prompt([
        {
            name: 'departmentName',
            type: 'input',
            message: 'Enter the name of the new department:'
        }
    ]).then((response)=>{
        bridge.query(`INSERT INTO department (department_name) VALUES (?)`, [response.departmentName], (err, result) => {
       
        console.log(response.departmentName+"added to Department")
        main()
    });
    })

}

function performAction(input){
    console.log(input.action);
    switch(input.action){
    case 'View All Employees':
        console.log("correct spot");
        viewEmployees();
        break;
    case 'Add Employee':
        addEmployee();
        break;
    case 'Update Employee Role':
        updateEmployee();
        break;
    case 'View All Roles':
        viewRoles();
        break;
    case 'Add Role':
        addRole();
        break;
    case 'View All Departments':
        viewDepartments();
        break;
    case 'Add Department':
        addDepartment();
        break;
    case 'Quit':
        bridge.end();
        break; 
}
}

function main(){
    inquirer.prompt(mainQuestion).then((response)=>{
    console.log("main");
    performAction(response)});
}
main()
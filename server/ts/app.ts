///<reference path="../typings/globals/vue/index.d.ts" />

var app = new Vue({
    el: "#app",
    data: {
        newTodo:"",
        todos: [
            { text: "Add some todos" }
        ]
    },
    methods: {
       addTodo() {
           var text = this.newTodo.trim();
           if (text) {
               this.todos.push({ text: text });
               this.newTodo = "";
           }
        },
        removeTodo(index) {
            this.todos.splice(index, 1);
        }
    }
});
export interface User {
    id: number,
    email: string,
    todo: Todo
}

export interface Todo {
    id: number,
    title: string,
    creator: User
}

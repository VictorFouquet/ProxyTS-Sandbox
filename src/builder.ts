function Uncapitalize(str: string){
    // Return the input string with its first character converted to lowercase,
    // concatenated with the rest of the string starting from the second character
    return str.charAt(0).toLowerCase() + str.slice(1);
}

type EntityBuilder<T> = {
    [K in keyof T as `with${Capitalize<K & string>}`] :
        T[K] extends number | string | boolean | Date ? (v: T[K]) => EntityBuilder<T> :
        T[K] extends object ? (callback: (f: EntityBuilder<T[K]>) => void) => EntityBuilder<T> :
        never
} & {
    build: () => T
}

const Builder = <T extends object>(v: T = {} as T) => {
    const toBuild = v ?? {} as T;

    const proxy = new Proxy({ } as EntityBuilder<T>, {
        get: (target: EntityBuilder<T>, prop: string) => {
            if (prop === 'build') {
                return () => toBuild;
            }

            return (value: any) => {
                const cleanProp = Uncapitalize(prop.toString().slice("with".length)) as keyof T;

                if (typeof value === 'function') {
                    toBuild[cleanProp] = value(Builder()).build();
                } else {
                    toBuild[cleanProp] = value;
                }

                return proxy
            }
        }
    })

    return proxy;
}

interface User {
    id: number,
    email: string,
    todo: Todo
}

interface Todo {
    id: number,
    title: string,
    creator: User
}

console.log(
    Builder<User>()
        .withEmail("jean")
        .withTodo(t => t.withId(2))
        .build()
)

console.log(
    Builder<User>()
        .withTodo(t => t.withCreator(u => u.withId(2)))
        .build()
)

function testUser(user: User) {}
function testTodo(todo: Todo) {}

testUser(Builder<User>().withEmail("john.doe@mail.com").build());
testTodo(Builder<User>().withTodo(t => t.withId(1)).build().todo);

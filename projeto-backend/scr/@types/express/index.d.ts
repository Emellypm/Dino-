declare namespace Express{
    export interface Request{
        usuarioId: string         
        usuarioTipo: "ADMIN" | "CLIENTE"
    }
}
export function checkAuthentication() {
    return function(
        target: any,
        propertyKey: string,
        descriptor: PropertyDescriptor
    ) {
        const method = descriptor.value;
        descriptor.value = async function(...args: Array<any>) {
            let out: any;
            if(!this.drive) {
                await this.auth();
            }
            out = await method.apply(this, args);
            return out;
        }
        return descriptor;
    }
}
class StateStore {
    #Data = {};

    insert(name, value) {
        this.#Data[name] = value;
        return true;
    }
    get(name){
        return this.#Data[name];
    }
}



const State = new StateStore();
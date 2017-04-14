import Node from './Node';

export default class LinkedList {

    /**
     * @constructor create LinkedList instance
     * @param {Object[]} data - array of slides
     */
    constructor(data) {
        this.current = false;

        if (typeof data != "undefined") {
            let keys = Object.keys(data);
            if (keys.length > 0) {
                let newData = this.addFirst(data);

                for (let id in newData) {
                    let current = this.current;
                    this.current.next = new Node(data[id]);
                    this.current = this.current.next;
                    this.current.prev = current;
                }
                this.current.next = null;
            }
        }
    }

    /**
     * @method
     * @param {int} id
     * @description search for node with data.id == id
     */
    getNodeById(id) {
        let current = this.getFirst();
        while (current.data.id != id) {
            current = current.next;
        }
        this.current = current;
        return current;
    }

    /**
     * @method
     * @description set current to the first node
     */
    toBegin() {
        while (this.prev());
    }

    /**
     * @method
     * @description set current to the last node
     */
    toEnd() {
        while (this.next());
    }

    /**
     * @method
     * @description set current to the first node
     * @return {Node} first node
     */
    getFirst() {
        let current = this.current;
        while(current.prev !== null){
            current = current.prev;
        }
        return current;
    }

    /**
     * @method
     * @description set current to the last node
     * @return {Node} last node
     */
    getLast() {
        let current = this.current;
        while(current.next !== null){
            current = current.next;
        }
        return current;
    }

    /**
     * @method
     * @description print all the list from 1st element to console
     */
    print() {
        let i = 0, current = this.getFirst();
        while (current !== null) {
            console.log(i++, current);
            current = current.next;
        }
    }

    /**
     * @method
     * @return {boolean}
     */
    hasPrev(){
        return this.current.prev !== null;
    }

    /**
     * @method
     * @return {Node|boolean}
     */
    getPrev() {
        if(this.current.prev !== null){
            return this.current = this.current.prev;
        }
        return false;
    }

    /**
     * @method
     * @description set prev node as current
     * @return {boolean}
     */
    prev(){
        if(this.current.prev !== null){
            this.current = this.current.prev;
            return true;
        }
        return false;
    }

    /**
     * @method
     * @return {boolean}
     */
    hasNext(){
        return this.current.next !== null;
    }

    /**
     * @method
     * @return {Node|boolean}
     */
    getNext() {
        if(this.current.next !== null){
            return this.current = this.current.next;
        }
        return false;
    }

    /**
     * @method
     * @description set next node as current
     * @return {boolean}
     */
    next(){
        if(this.current.next !== null){
            this.current = this.current.next;
            return true;
        }
        return false;
    }

    /**
     * @method
     * @return {boolean}
     */
    isEmpty() {
        return this.current != false;
    }

    /**
     * @method
     * @param {object} data
     * @description create Node objects from data, prepend them to list
     */
    addBefore(data) {
        let current = this.getFirst();
        for(let id in data){
            let next = current;
            current.prev = new Node(data[id]);
            current = current.prev;
            current.next = next;
        }
        current.prev = null;
    }

    /**
     * @method
     * @param {object} data
     * @description create Node objects from data, prepend them to list
     */
    addAfter(data) {
        let current = this.getLast();
        for(let id in data){
            let prev = current;
            current.next = new Node(data[id]);
            current = current.next;
            current.prev = prev;
        }
        current.next = null;
    }

    /**
     * @method
     * @param {object} data
     * @return {object} data without 1st element
     */
    addFirst(data) {
        this.current = new Node(data.shift());
        this.current.prev = null;
        this.current.next = null;
        return data;
    }

    /**
     * @method
     * @param {removeCallbackLeft|removeCallbackRight} callback - function to call at each node
     * @description iterates over nodes, execute callback function for each node
     */
    iterate(callback){
        let current = this.getFirst();
        while(current.next != null){
            callback(current);
            current = current.next;
        }
    }
}

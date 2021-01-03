export default class Likes {
    constructor() {
        this.likes = [];
    }

    addLike(id, title, author, img) {
        const like = {
            id,
            title,
            author,
            img,
        };
        this.likes.push(like)

//add to ls
        this.persistData()

        return like
    }

    deleteLike(id){
        const index = this.likes.findIndex( el => el.id === id)
       this.items.splice(index, 1 ) 

       //del locstorage
       this.persistData()
    }

    isLiked(id){
        return this.likes.findIndex(el => { el.id === id}) !== -1
    }

    getNumLikes(){
        return this.likes.length
    }

    persistData(){
        localStorage.setItem('likes',JSON.stringify(this.likes))
    }
    readStorage(){
        const storage = JSON.parse(localStorage.getItem('likes'))
        //restore likes from ls
        if(storage) this.likes =storage
    }
}
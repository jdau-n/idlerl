var Game = {
	w: 150,
	h: 80,
    display: null,
 
    init: function() {
        this.display = new ROT.Display({width:this.w, height:this.h, fontSize:6});
        document.body.appendChild(this.display.getContainer());
    }
}

Game.init();
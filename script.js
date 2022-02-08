document.addEventListener("DOMContentLoaded", ()=>{

    let canvas = document.querySelector("#canvas");
    let context = canvas.getContext("2d");

    const width_block = 30;
    const height_block = 30; 

    canvas.width = width_block * 10 + 200;
    canvas.height = height_block * 20;

    // let rotate_audio = new Audio();
    // rotate_audio.src = "tetris_rotate.mp3";

    // let collapse_audio = new Audio();
    // collapse_audio.src = "tetris_collapse.mp3";

    // let audio_delete_string = new Audio();
    // audio_delete_string.src = "tetris_delete_string.mp3";

    let game_over = false;
    let score = 0;

    let motion = {
        move_left: false,
        move_right: false,
        click_space: false,
        db_click: false,
        flag: true
    }

    document.addEventListener("keydown", (event)=>{
            
        if(event.key == 'a' && motion.flag){
            motion.move_left = true;
            motion.flag = false;
        }

        if(event.key == 'd' && motion.flag){
            motion.move_right = true;
            motion.flag = false;
        }

        if(event.key == ' ' && motion.flag){
            motion.click_space = true;
            motion.flag = false;

            // rotate_audio.pause();
            // rotate_audio.currentTime = 0.0;

            // rotate_audio.play();

        }

    });

    document.addEventListener("keyup", (event)=>{

        if(event.key == 'a'){
            motion.move_left = false;
            motion.flag = true;
        }

        if(event.key == 'd'){
            motion.move_right = false;
            motion.flag = true;
        }

        if(event.key == ' '){
            motion.click_space = false;
            motion.flag = true;
        }

    });

    document.addEventListener("dblclick", ()=>{

        motion.db_click = true;

    });

    ///////////////////////////////////////////////////////
    //i - position_y // y - position - position_x
    //////////////////////////////////////////////////////////////////


    function draw_grid(){
        
        context.beginPath();

        for(let i = 0; i < 10; i++){
            
            context.moveTo(30 * i, 0);
            context.lineTo(30 * i, canvas.height);
            
        }

        for(let j = 0; j < 20; j++){
            
            context.moveTo(0, 30 * j);
            context.lineTo(canvas.width - 200, 30 * j);

        }

        context.strokeStyle = "black";
        context.stroke();

    }


    function init_field(){
        
        let field = [];

        for(let i = 0 ; i < 20; i++){

            field.push([]);

            for(let j = 0; j < 10; j++){
                field[i].push({empty: true, color_block: ""});
            }

        }

        return field;
    }
    

    class Abstract_figure{

        constructor(){

            this.info = [];

            this.color = "";

            this.count_frame_y = 0;
            this.speed_dive = 10;

            this.state = {
                MOVE: true,
                STOP: false
            }

        }

        draw(){

            let center = this.info[0];

            context.beginPath();

            for(let i = 1 ; i < this.info.length; i++){
                
                context.rect(center.x + this.info[i].x + 1, center.y + this.info[i].y + 1, 28, 28);

            }

            context.fillStyle = this.color;
            context.fill();

        };

        change_postion_x(){

            if(motion.move_left){

                let index_x = 0;
                let index_y = 0;

                let on_field = false;

                on_field = this.info.every((block)=>{

                    return (Math.round((this.info[0].y + block.y) / 30)) >= 0;

                });

                for(let i = 1; i < this.info.length; i++){

                    index_x = Math.round((this.info[0].x + this.info[i].x) / 30);
                    index_y = Math.round((this.info[0].y + this.info[i].y) / 30);

                    if(on_field){
                        if(index_x == 0 || !field[index_y][index_x - 1].empty){
                            return;
                        }
                    }

                }

                this.info[0].x -= 30;
                motion.move_left = false;
            }


            if(motion.move_right){

                let index_x = 0;
                let index_y = 0;

                let on_field = false;

                on_field = this.info.every((block)=>{

                    return (Math.round((this.info[0].y + block.y) / 30)) >= 0;

                });

                for(let i = 1; i < this.info.length; i++){

                    index_x = Math.round((this.info[0].x + this.info[i].x) / 30);
                    index_y = Math.round((this.info[0].y + this.info[i].y) / 30);

                    if(on_field){
                        if(index_x == 9 || !field[index_y][index_x + 1].empty){
                            return;
                        }
                    }

                }

                this.info[0].x += 30;
                motion.move_right = false;

            }
        }


        change_postion_y(){
            
            this.count_frame_y++;
            
            if(motion.db_click){

                this.speed_dive = 2;
                motion.db_click = false;

            }

            if(this.count_frame_y > this.speed_dive){

                let next_position_x = 0;
                let next_position_y = 0;

                //в цикле проверем, можно ли блоку спуститься на 1-у ячейку ниже
                for(let i = 1; i < this.info.length; i++){

                    next_position_x = (this.info[0].x + this.info[i].x) / 30;
                    next_position_y = (this.info[0].y + this.info[i].y + 30) / 30;

                    if(next_position_y == 20){
                        
                        this.state.STOP = true;
                        this.state.MOVE = false;

                        // collapse_audio.play();

                        this.add_on_field_new_blocks();
                        
                        return;

                    }else if(field[next_position_y][next_position_x].empty != true){
                    
                                this.state.STOP = true;
                                this.state.MOVE = false;

                                // collapse_audio.play();

                                //если ниже фигуры нет места и выше только потолок, то прерываем игровой цикл - игра окончена
                                if(this.info[0].y <= 0){

                                    game_over = true;
                                    return;

                                }

                                this.add_on_field_new_blocks();
                                
                                return;
                        
                    }

                }

                //если цикл не обнаружил препятствий ниже, смещаемся вниз
                //смещаем только координаты центра фигуры, т.к. все яцейки заданы постоянным смещением от середины
                this.info[0].y += 30;

                this.count_frame_y = 0;

            }

        }

        add_on_field_new_blocks(){

            let index_block_x = 0;
            let index_block_y = 0; 

            for(let i = 1; i < this.info.length; i++){

                index_block_x = Math.round((this.info[0].x + this.info[i].x) / 30);
                index_block_y = Math.round((this.info[0].y + this.info[i].y) / 30);

                field[index_block_y][index_block_x] = {empty: false, color: this.color};


            }

        }

        rotate_90(){

            if(motion.click_space){

                let new_x = 0;
                let new_y = 0;

                let index_x = 0;
                let index_y = 0;

                let new_info = [{x: this.info[0].x, y: this.info[0].y}];

                for(let i = 1; i < this.info.length; i++){

                    new_x = this.info[i].x * Math.cos(Math.PI / 2) + this.info[i].y * Math.sin(Math.PI / 2);
                    new_y = (-this.info[i].x * Math.sin(Math.PI / 2) + this.info[i].y * Math.cos(Math.PI / 2) - 30);

                    index_x = Math.round((this.info[0].x + new_x) / 30);
                    index_y = Math.round((this.info[0].y + new_y) / 30);

                    if(index_x >= 0 && index_x < 10 && index_y >= 0 && index_y < 20){

                        if(field[index_y][index_x].empty == true){
                            
                            new_info.push({x: Math.round(new_x), y: Math.round(new_y)});

                        }else{
                            console.log("Нельзя произвести поворот");
                        }

                    }else{
                        console.log("Нельзя произвести поворот");
                    }

                }

                // console.log(new_info);
            
                if(new_info.length == 5){
                    this.info = new_info;
                }

                motion.click_space = false;

            }

        }

    }

    class First_figure extends Abstract_figure{

        constructor(){
           
            super();

            this.info = [
                {x: (canvas.width - 200) / 2, y: 0},
                {x: -60, y: -30},
                {x: -30, y: -30},
                {x: 0, y: -30},
                {x: 30, y: -30}
            ];

            this.color = `rgb(${Math.random() * 192 + 64},${Math.random() * 192 + 64},${Math.random() * 192 + 64})`;
        
        }

    }

    class Second_figure extends Abstract_figure{

        constructor(){

            super();

            this.info = [
                {x: (canvas.width - 200) / 2, y: 0},
                {x: -30, y: -30},
                {x: 0, y: -30},
                {x: 0, y: 0},
                {x: 0, y: 30}
            ];

            this.color = `rgb(${Math.random() * 192 + 64},${Math.random() * 192 + 64},${Math.random() * 192 + 64})`;

        }

    }

    class Third_figure extends Abstract_figure{

        constructor(){

            super();

            this.info = [
                {x: (canvas.width - 200) / 2, y: 0},
                {x: -30, y: -30},
                {x: 0, y: -30},
                {x: 0, y: 0},
                {x: -30, y: 0}
            ];

            this.color = `rgb(${Math.random() * 192 + 64},${Math.random() * 192 + 64},${Math.random() * 192 + 64})`;

        }

    }

    class Fourth_figure extends Abstract_figure{

        constructor(){

            super();

            this.info = [
                {x: (canvas.width - 200) / 2, y: 0},
                {x: -30, y: -30},
                {x: 0, y: -30},
                {x: -30, y: 0},
                {x: -30, y: 30}
            ];

            this.color = `rgb(${Math.random() * 192 + 64},${Math.random() * 192 + 64},${Math.random() * 192 + 64})`;

        }

    }

    class Fifth_figure extends Abstract_figure{

        constructor(){

            super();

            this.info = [
                {x: (canvas.width - 200) / 2, y: 0},
                {x: 0, y: 30},
                {x: 0, y: 0},
                {x: -30, y: 0},
                {x: 0, y: -30}
            ];

            this.color = `rgb(${Math.random() * 192 + 64},${Math.random() * 192 + 64},${Math.random() * 192 + 64})`;

        }

    }

    class Sixth_figure extends Abstract_figure{

        constructor(){

            super();

            this.info = [
                {x: (canvas.width - 200) / 2, y: 0},
                {x: -30, y: 0},
                {x: 0, y: 0},
                {x: 0, y: -30},
                {x: 30, y: -30}
            ];

            this.color = `rgb(${Math.random() * 192 + 64},${Math.random() * 192 + 64},${Math.random() * 192 + 64})`;

        }

    }

    class Seventh_figure extends Abstract_figure{

        constructor(){

            super();

            this.info = [
                {x: (canvas.width - 200) / 2, y: 0},
                {x: -30, y: 0},
                {x: 0, y: 0},
                {x: -30, y: -30},
                {x: -60, y: -30}
            ];

            this.color = `rgb(${Math.random() * 192 + 64},${Math.random() * 192 + 64},${Math.random() * 192 + 64})`;

        }

    }


    function draw_background(){

        //отрисовываем задний фон
        context.beginPath();
        context.rect(0, 0, canvas.width - 200, canvas.height);
        context.fillStyle = "white";
        context.fill();

        //отрисовываем блоки, которые уже приземлились
        
        // context.beginPath();
    
        for(let i = 0; i < 20; i++){

            for(let j = 0; j < 10; j++){
                
                if(field[i][j].empty == false){
                    
                    context.beginPath();
                    context.rect(j * 30, i * 30, 30, 30);
                    context.fillStyle = field[i][j].color;
                    context.fill();

                }

            }

        }


    }

    function check_all_string(){
        
        let fill_string = false;
        let multiple = 0;

        for(let i = 0; i < 20; i++){

            fill_string = field[i].every((block)=>{
                
                return block.empty == false;

            });

            if(fill_string){
                
                multiple++;

                for(let j = i; j > 0; j--){
                    
                    for(let y = 0; y < 10; y++){

                        field[j][y] = field[j - 1][y];

                    }

                }

                for(let j = 0; j < 10; j++){
                    field[0][j] = {empty: true, color: ""};
                }

                // audio_delete_string.play();
            }

        }

        if(multiple != 0){
            score += 100 * (1 +  Math.pow(2, multiple));
            multiple = 0;

            draw_score();
        }

    }

    function draw_score(){

        context.clearRect(canvas.width - 200, canvas.height / 5 - 30, 200, 75);

        context.font = "24px Comic Sans MS";
        context.fillStyle = "white";
        context.textAlign = "center";
        context.fillText("Score", canvas.width - 100, canvas.height / 5);
        context.fillText(score, canvas.width - 100, canvas.height / 5 + 30);

    }

    function get_random_class(){

        let random_number = Math.random();
        let random_class = null;

        switch (true){

            case (random_number < 0.14):{
                random_class = new First_figure();
                break;
            }

            case (random_number > 0.14 && random_number < 0.28):{
                random_class = new Second_figure();
                break;
            }

            case (random_number > 0.28 && random_number < 0.42):{
                random_class = new Third_figure();
                break;
            }

            case (random_number > 0.42 && random_number < 0.56):{
                random_class = new Fourth_figure();
                break;
            }

            case (random_number > 0.56 && random_number < 0.70):{
                random_class = new Fifth_figure();
                break;
            }

            case (random_number > 0.70 && random_number < 0.84):{
                random_class = new Sixth_figure();
                break;
            }

            case (random_number > 0.84 && random_number < 1):{
                random_class = new Seventh_figure();
                break;
            }

        }

        return random_class;
    }

    function draw_next_figure(){

        context.beginPath();
        context.rect(canvas.width - 160, canvas.height / 2 - 60, 120, 120);
        context.fillStyle = "black";
        context.fill();
    
        context.beginPath();
        next_block.info.forEach((block)=>{

            context.rect(canvas.width - 100 + block.x, canvas.height / 2 + block.y, 30, 30);

        });
        context.fillStyle = next_block.color;
        context.fill();

        context.font = "24px Comic Sans MS";
        context.fillStyle = "white";
        context.textAlign = "center";
        context.fillText("Next figure", canvas.width - 100, canvas.height / 2 - 60);

    }


    function game_loop(){

        draw_background();
        draw_grid();

        if(current_block.state.MOVE){
            
            current_block.draw();
            current_block.change_postion_y();
            current_block.change_postion_x();
            current_block.rotate_90();

        }else{
            
            //проверяем заполнена ли какая-либо строка
            check_all_string();

            //если предыдущий блок завершил движение, то последующий станет основным
            current_block = next_block;
            current_block.draw();
            current_block.change_postion_y();
            current_block.rotate_90();

            //заранее создаем новый блок, чтобы игрок видел, что за фигура будет дальше
            next_block = get_random_class();

            draw_next_figure(next_block);

        }
        
        if(!game_over){
            
            id_game_loop = requestAnimationFrame(game_loop);
            
        }else{

            console.log("We lost");

        }

    }

    let field = init_field();
    let current_block = new First_figure();
    let next_block = get_random_class();
    
    draw_score();
    draw_next_figure(next_block);

    game_loop();


});
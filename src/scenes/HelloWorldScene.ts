import Phaser from 'phaser'

export default class HelloWorldScene extends Phaser.Scene
{   
    // biến tĩnh nhận tác động vật lý
    private platforms?: Phaser.Physics.Arcade.StaticGroup;
    // biến động tác động vật lý
    private player?:Phaser.Physics.Arcade.Sprite;
    // tạo tương tác ở phím
    private cursors?:Phaser.Types.Input.Keyboard.CursorKeys;
    // tạo icon star
    private stars?:Phaser.Physics.Arcade.Group;
    // điểm số
    private score:Number=0;
    // set lại điểm số
    private scoreText?:Phaser.GameObjects.Text;
    // tạo bom
    private bombs?:Phaser.Physics.Arcade.Group;

    private gameOver:Boolean = false;
	constructor()
	{
		super('hello-world')
	}

	preload()
    {
        // định nghĩa ảnh và gán tên cho chúng
      this.load.image('sky', 'assets/sky.png');
      this.load.image('ground','assets/platform.png');
      this.load.image('star','assets/star.png');
      this.load.image('bomb','assets/bomb.png');
      this.load.image('over','assets/over.png');
      // thiết lập khung hình 
      this.load.spritesheet('dude','assets/dude.png',{
          frameWidth:32,frameHeight:48
          });
    }


    create()
    {
        // tạo vị trí và sử dụng ảnh đã tạo từ trước
        this.add.image(400,300,'sky');
        
        // this.add.image(400,300,'star');
        // tạo nhóm vật lý tĩnh và gán vào biến toàn cục
        this.platforms = this.physics.add.staticGroup();
        // thêm 1 hình ảnh mặt đất với kích thước 400*568 hình ảnh đc định vị từ tâm của nó
        const ground = this.platforms.create(400,568,'ground') as Phaser.Physics.Arcade.Sprite
        // mở rộng toàn bộ chiều rộng của trò chơi chia tỉ lệ x2 với hàm setScale 
        // khi đã thu nhỏ tỉ lệ thì gọi đến hàm refreshBody để nó mở rộng nền tảng hết khung hình
       ground
       .setScale(2).refreshBody();
        // tạo các nền tảng khác 
        this.platforms.create(600,400, 'ground');
        this.platforms.create(50, 250, 'ground');
        this.platforms.create(750, 220, 'ground');
        // tạo vật lý động theo mặc định
        this.player = this.physics.add.sprite(100,450, 'dude');
        /*sau khi tạo ra sprite nó đc cung cấp 1 giá trị 0.2 
        Điều này có nghĩa là khi nó tiếp đất sau khi nhảy, 
        nó sẽ nảy lên một chút. Sprite sau đó được thiết lập để
         va chạm với các giới hạn của thế giới. 
        Các giới hạn, theo mặc định, nằm bên ngoài các kích thước trò chơi.
         Khi chúng tôi đặt trò chơi là 800 x 600 thì người chơi sẽ không thể chạy ra ngoài khu vực này.
         Nó sẽ ngăn người chơi chạy khỏi các cạnh của màn hình hoặc nhảy qua đỉnh. 
         */
        this.player.setBounce(0.2);
        this.player.setCollideWorldBounds(true)
        /*dude tổng cộng có 9 khung hình,
        trong đó 4 khung hình chạy qua trái
        1 khung hình hướng giữa và 
        4 khung hình chạy qua phải
        */
        /*
        loạt ảnh bên trái sử dụng khung hình 0,1,2,3 nên start:0 và end:3 với tốc độ
        10 khung hình/giây và giá trị -1 có nghĩa là lặp lại khung hình
         */

         // di chuyển qua trái
        this.anims.create({
            key:"left", // từ khóa di chuyển 
            frames:this.anims.generateFrameNumbers('dude',{
                start:0, end:3 // khung hình bắt đầu từ index[0] và kết thúc index[3]
            }),
            frameRate:10, // tốc độ của mỗi khung hình 10khung hình/ s
            repeat:-1 // giá trị -1 => lặp lại khung hình
        })
        // đứng yên ở giữa
        this.anims.create({
            key:"turn",
            frames:[{key:'dude', frame:4}],
            frameRate:20
        });

        // di chuyển qua phải

        this.anims.create({
            key:"right",
            frames:this.anims.generateFrameNumbers('dude',{start:5,end:8}),
            frameRate:10,
            repeat:-1
        })
        // sử dụng để cho phép va chạm giữa các nền tảng hoặc chồng chéo lên nhau
         this.physics.add.collider(this.player, this.platforms)
         // khởi tạo tương tác với bàn phím
         this.cursors = this.input.keyboard.createCursorKeys();
         // khởi tạo star

         this.stars= this.physics.add.group({
             key:'star',
             repeat:11, // lặp lại 11 lần tổng 12 ngôi sao đc tạo ra
             setXY:{x:12,y:0,stepX:70} // vị trí xuất hiện bắt đầu là x và stepX là khoảng cách giữa các vị trí là 70
         });


         // lặp lại các phần tử con trong nhóm và cung cấp giá trị nảy lên ngẫu nhiên từ 0.4 - 0.8
         this.stars.children.iterate((item)=>{
            const child = item as Phaser.Physics.Arcade.Image;
            child.setBounceY(Phaser.Math.FloatBetween(0.4,0.8));
         })

         // cho phép va chạm giữa nền tảng và star
         this.physics.add.collider(this.stars, this.platforms)
         // kiểm tra sự trùng lăp khi player va chạm stars sẽ chuyển đến hàm handleColectStar để vô hiệu hóa vật lý của star đó
         this.physics.add.overlap(this.player, this.stars, this.handleColectStar, undefined,this)
        // setup vị trí, cỡ chữ, màu chữ score
         this.scoreText = this.add.text(16,16,'score:0',{
            fontSize:'32px', 
            fill:'red'
         });
         // tạo vật lý cho bom
         this.bombs= this.physics.add.group();
         // cho phép va chạm giữa bom và nền tảng
         this.physics.add.collider(this.bombs, this.platforms);
         // cho phép va chạm giữa bom và người chơi
         this.physics.add.collider(this.bombs, this.player, this.handleHitBoms, undefined, this);
    }


    // hàm bắt va chạm xóa vật lý star và cộng điểm vào score
    private handleColectStar(player: Phaser.GameObjects.GameObject, sta: Phaser.GameObjects.GameObject) {
        const star = sta as Phaser.Physics.Arcade.Image;
        star.disableBody(true, true)
        this.score +=10;
        this.scoreText?.setText(`score:  ${this.score}`);

        if(this.stars?.countActive(true)===0){
            this.stars.children.iterate(child=>{
                const children = child as Phaser.Physics.Arcade.Image;
                children.enableBody(true, children.x,0,true, true)
            })
            if(!this.player){
                return;
            }
            const x = this.player.x<400
            ?Phaser.Math.Between(400,800):Phaser.Math.Between(0,400);
            const bomb:Phaser.Physics.Arcade.Image = this.bombs?.create(x, 16,'bomb');
            bomb.setBounce(1);
            bomb.setCollideWorldBounds(true);
            bomb.setVelocity(Phaser.Math.Between(-200,200),20)
        }
    }

    private handleHitBoms(player: Phaser.GameObjects.GameObject, boms: Phaser.GameObjects.GameObject){
        this.physics.pause();
        this.player?.setTint(0xff000);
        this.player?.anims.play('turn');
        this.gameOver = true
        this.add.image(410,240,'over');
    }
    update(){
        // không có cursors 
        if(!this.cursors){
            return;
        }
        // di chuyển snag trái
        if(this.cursors.left?.isDown){
            // đặt vận tốc ngang của vật lý
            this.player?.setVelocityX(-160);
            // chạy anims để làm cho khung hình chuyển động
            this.player?.anims.play('left',true);
        }else if(this.cursors.right?.isDown){
            this.player?.setVelocityX(160);
            this.player?.anims.play('right',true);
        }else{
            this.player?.setVelocityX(0);
            this.player?.anims.play('turn');
        }

        if(this.cursors.up?.isDown && this.player?.body.touching.down){
            //đặt vận tốc dọc của vật lý
            this.player.setVelocityY(-330);
        }
    } 
}

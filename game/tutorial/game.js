var tutorial = function(game) {

};

tutorial.prototype = {
    sounds: {},
    notes: ["c", "d", "e", "f", "g", "a", "b", "c", "d", "e", "f", "g"],
    octaves: [4, 4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 5],

    // Hard-coded questions/answers for tutorial
    questions: ["2 + 2", "7 - 2", "4 + 5", "8 + 3"],
    answers: ["9", "4", "5", "11"],
    angles: [0, 90, 180, 270],

    score: 0,
    score_multiplier: 1,
    score_selectors: 0,

    bubbles: [],
    wand: {},
    text: {},
    score_text: {},
    score_multiplier_text: {},
    bg: {},
    progressBar: null,

    bubbleSelection: 0,
    questionIndex: 0,
    incorrectCounter: 0,
    won: false,

    tutorial_objects: [],
    tutorial_states: [],
    tutorial_state_idx: -1,
    tutorial_running: true,

    preload: function() {
        this.loadGFXAssets();
        this.loadSFXAssets();
    },

    create: function() {
        this.addSFXAssets();

        if (Globals.MusicEnabled) {
            this.sounds['bgm'].play();
        }

        if (Globals.ControlSel === 0) {
            this.bindKeys();
            if (Globals.DictationEnabled) {
                this.bindDictationKeys();
            }
        }
        this.bindEssentialKeys();
        this.initializeTutorial();
    },

    update: function() {
        if (this.questionIndex < this.questions.length) {
            this.updateBubbleColors();
            this.updateGFX();
        }

        if (this.questionIndex == this.questions.length) {
            if (this.interval !== null) {
                // TODO: What is this?
                clearInterval(this.interval);
            }
        }

        if (Globals.ControlSel === 2) {
            this.bindControllerScheme(0);
        } else if (Globals.ControlSel === 3) {
            this.bindControllerScheme(1);
        }
    },

    initializeTutorial: function() {
        this.questions = ["2 + 2", "7 - 2", "4 + 5", "8 + 3"];
        this.answers = ["9", "4", "5", "11"];
        this.angles = [0, 90, 180, 270];

        this.score = 0;
        this.score_multiplier = 1;
        this.score_selectors = 0;

        this.bubbleSelection = 0;
        this.questionIndex = 0;
        this.incorrectCounter = 0;
        this.won = false;

        this.drawGFX();
        this.drawBubbles();

        this.tutorial_state_idx = -1;
        this.tutorial_running = true;

        this.tutorial_objects = [
            this.text.question,
            this.text.score,
            this.text.multiplier,
            this.text.progress,
            this.progressBar,
            this.bg,
        ];
        let bubble_objects_and_wand = [this.wand];
        for (const bubble of this.bubbles) {
            bubble_objects_and_wand.push(bubble.sprite);
            bubble_objects_and_wand.push(bubble.numText);
        }
        for (const bubble_obj of bubble_objects_and_wand) {
            this.tutorial_objects.push(bubble_obj);
        }

        let outer = this;

        let dim_alpha = 0.2;

        this.tutorial_states = [];
        this.tutorial_states.push({
            objs: [this.text.question],
            text: "This is the current question",
            callback: function() {
                for (let obj of outer.tutorial_objects) {
                    obj.alpha = dim_alpha;
                    for (let myobj of this.objs) {
                        if (myobj === obj) {
                            obj.alpha = 1.0;
                        }
                    }
                }
                if (Globals.DictationEnabled) {
                    Speech.read(this.text);
                }
                console.log(this.text);
            }
        });
        this.tutorial_states.push({
            objs: bubble_objects_and_wand,
            text: "This is where you select the bubble that answers the current question",
            callback: function() {
                for (let obj of outer.tutorial_objects) {
                    obj.alpha = dim_alpha;
                    for (let myobj of this.objs) {
                        if (myobj === obj) {
                            obj.alpha = 1.0;
                        }
                    }
                }
                if (Globals.DictationEnabled) {
                    Speech.read(this.text);
                }
                console.log(this.text);
            }
        });
        this.tutorial_states.push({
            objs: [this.text.score, this.text.multiplier],
            text: "This is your current score and streak",
            callback: function() {
                for (let obj of outer.tutorial_objects) {
                    obj.alpha = dim_alpha;
                    for (let myobj of this.objs) {
                        if (myobj === obj) {
                            obj.alpha = 1.0;
                        }
                    }
                }
                if (Globals.DictationEnabled) {
                    Speech.read(this.text);
                }
                console.log(this.text);
            }
        });
        this.tutorial_states.push({
            objs: [this.text.progress, this.progressBar],
            text: "This is your current progress",
            callback: function() {
                for (let obj of outer.tutorial_objects) {
                    obj.alpha = dim_alpha;
                    for (let myobj of this.objs) {
                        if (myobj === obj) {
                            obj.alpha = 1.0;
                        }
                    }
                }
                if (Globals.DictationEnabled) {
                    Speech.read(this.text);
                }
                console.log(this.text);
            }
        });
        this.tutorial_states.push({
            objs: [],
            text: "Ok, let's play!",
            callback: function() {
                for (let obj of outer.tutorial_objects) {
                    obj.alpha = 1.0;
                }
                if (Globals.DictationEnabled) {
                    Speech.read(this.text);
                }
                outer.tutorial_running = false;
                console.log(this.text);
            }
        });

        // Start tutorial
        this.Select();
    },

    loadGFXAssets: function() {
        this.game.load.image('bg', 'assets/images/background.png');
        this.game.load.image('usagi', 'assets/images/bunny.png');
        this.game.load.image('bubble', 'assets/images/bubble.png');
        this.game.load.image('wand', 'assets/images/wand.png');
        this.game.load.spritesheet('bubble-pop', 'assets/sheets/bubble-popping.png', 256, 256);
        this.game.load.spritesheet('usagi-jump', 'assets/sheets/bunny-jump.png', 256, 256);
    },

    loadSFXAssets: function() {
        if (Globals.MusicEnabled) {
            // Background music
            this.game.load.audio('bgm', 'assets/audio/8bit_bg.wav');
        }

        if (Globals.SoundEnabled) {
            // Bubble popping sounds
            this.game.load.audio('pop_1', 'assets/audio/bubble-pop-1.mp3');
            this.game.load.audio('pop_2', 'assets/audio/bubble-pop-2.mp3');
            this.game.load.audio('pop_3', 'assets/audio/bubble-pop-3.mp3');

            // Wrong answer
            this.game.load.audio('wrong', 'assets/audio/wrong-1.mp3');

            // Victory
            this.game.load.audio('win', 'assets/audio/achievement.mp3');
        }
    },

    addSFXAssets: function() {
        if (Globals.MusicEnabled) {
            this.sounds['bgm'] = this.game.add.audio('bgm');
            this.sounds['bgm'].loop = true;
            this.sounds['bgm'].volume = 0.25;
        }

        if (Globals.SoundEnabled) {
            // Popping sounds
            this.sounds['pops'] = [];
            this.sounds['pops'].push(this.game.add.audio('pop_1'));
            this.sounds['pops'].push(this.game.add.audio('pop_2'));
            this.sounds['pops'].push(this.game.add.audio('pop_3'));

            // Incorrect
            this.sounds['wrong'] = this.game.add.audio('wrong');

            // Victory
            this.sounds['win'] = this.game.add.audio('win');

            tones.attack = 0;
            tones.release = 200;
            tones.type = "triangle";

            this.sounds['win'].volume = 0.3;
            this.sounds['wrong'].volume = 0.3;
        }
    },

    drawGFX: function() {
        let w = this.game.world.width;
        let h = this.game.world.height;
        this.bg = this.game.add.sprite(w/2, h/2, 'bg');
        this.bg.anchor.setTo(0.5, 0.5);
        this.bg.width = w;
        this.bg.height = h;

        this.text.score = this.game.add.text(this.game.world.width - 220, 50, "", {
            font: "bold 26px Comic Sans MS",
            fill: '#ffffff',
            boundsAlignH: 'center',
            boundsAlignV: 'middle',
            stroke: 'black',
            strokeThickness: 4,
        });
        this.text.score.anchor.setTo(0.0, 1.0);
        this.text.score.setText("Score: " + this.score);

        this.text.multiplier = this.game.add.text(this.game.world.width - 220, 100, "", {
            font: "bold 26px Comic Sans MS",
            fill: '#ffffff',
            boundsAlignH: 'center',
            boundsAlignV: 'middle',
            stroke: 'black',
            strokeThickness: 4,
        });
        this.text.multiplier.anchor.setTo(0.0, 1.0);
        this.text.multiplier.setText("x" + this.score_multiplier);

        this.text.question = this.game.add.text(this.game.world.centerX, 50, "", {
            font: "bold 36px Comic Sans MS",
            fill: "#ffffff",
            boundsAlignH: "center",
            boundsAlignV: "middle",
            stroke: 'black',
            strokeThickness: 4,
        });
        this.text.question.anchor.setTo(0.5, 0.5);

        let bunny = new Bunny(this.game, 150, 510, 200, 200);

        this.wand = new Wand(this.game, this.game.world.centerX, this.game.world.centerY, true);
        this.wand.rotateTo(this.angles[Globals.NumberBubbles][this.bubbleSelection]);

        // Progress text
        this.text.progress = this.game.add.text(this.game.world.width - 220, 180, "", {
            font: "bold 26px Comic Sans MS",
            fill: '#ffffff',
            boundsAlignH: 'center',
            boundsAlignV: 'middle',
            stroke: 'black',
            strokeThickness: 4,
        });
        this.text.progress.anchor.setTo(0.0, 1.0);
        this.text.progress.setText("Progress: " + String(this.questionIndex) + "/" + String(this.questions.length));

        // Progress bar
        this.progressBar = game.add.graphics(710,-300);
        this.progressBar.lineStyle(2, '0x000000');
        this.progressBar.beginFill('0xeeeeee',1);
        this.progressBar.drawRoundedRect(100,500,35,300,1);
        this.progressBar.endFill();
    },

    drawBubbles: function() {
        this.bubbles = [];

        const radii = [70, 100, 130];
        const radius = 15;

        for (let i = 0; i < this.angles.length; i++) {
            let angle = this.angles[i] * Math.PI / 180.0;

            let cx = this.game.world.centerX + radii[0] * Math.sin(angle);
            let cy = this.game.world.centerY - radii[0] * Math.cos(angle);

            let num = this.answers[i];

            this.bubbles.push(new Bubble(this.game, cx, cy, radius, num));
        }
    },

    updateBubbleColors: function() {
        for (let i = 0; i < this.bubbles.length; i++) {
            if (this.bubbles[i].popped) {
                this.bubbles[i].numText.fill = '#000000';
            } else {
                this.bubbles[i].numText.fill = '#ffffff';
            }
        }

        if (this.bubbles[this.bubbleSelection].popped) {
            this.bubbles[this.bubbleSelection].numText.fill = '#000000';
        } else {
            this.bubbles[this.bubbleSelection].numText.fill = '#ffff00';
        }
    },

    updateGFX: function() {
        this.text.score.setText("Score: " + this.score);
        this.text.multiplier.setText("x" + this.score_multiplier);
        this.text.question.setText(this.questions[this.questionIndex]);
    },

    updateProgressBar: function() {
        if (!this.won) {
            this.text.progress.setText("Progress: " + String(this.questionIndex) + "/" + String(this.questions.length));
        } else {
            this.text.progress.setText("Progress: " + String(this.questions.length) + "/" + String(this.questions.length));
        }
        this.progressBar.clear();
        this.progressBar = game.add.graphics(710,-300);
        this.progressBar.lineStyle(2, '0x000000');
        this.progressBar.beginFill('0xeeeeee',1);
        this.progressBar.drawRoundedRect(101,501,35,300,1);
        this.progressBar.endFill();
        for (let i = 1; i <= this.questionIndex; i++) {
            this.progressBar.beginFill('0x8CE9FF',1);
            this.progressBar.drawRoundedRect(102,502+(298/this.questions.length)*(this.questions.length - i),33,298/this.questions.length,1);
            this.progressBar.endFill();
        }
    },

    bindKeys: function() {
        let Q = this.game.input.keyboard.addKey(Phaser.Keyboard.Q);
        Q.onDown.add(this.rotateCCW, this);

        let E = this.game.input.keyboard.addKey(Phaser.Keyboard.E);
        E.onDown.add(this.rotateCW, this);

        let Spacebar = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        Spacebar.onDown.add(this.Select, this);

        if (Globals.DictationEnabled) {
            let R = this.game.input.keyboard.addKey(Phaser.Keyboard.R);
            R.onDown.add(function() {
                    Speech.readEq("The question is: " + this.questions[this.questionIndex] + ".");
            }, this)
        }
    },

    bindDictationKeys: function() {
        let A = this.game.input.keyboard.addKey(Phaser.Keyboard.A);
        A.onDown.add(Speech.decreaseRate);

        let D = this.game.input.keyboard.addKey(Phaser.Keyboard.D);
        D.onDown.add(Speech.increaseRate);
    },

    bindEssentialKeys: function() {
        let ESC = this.game.input.keyboard.addKey(Phaser.Keyboard.ESC);
        ESC.onDown.add(this.Esc, this);
    },

    rotateCW: function() {
        if (!this.tutorial_running) {
            this.score_selectors++;

            do {
                this.bubbleSelection = (this.bubbleSelection + 1) % this.questions.length;
            } while (!this.won && this.bubbles[this.bubbleSelection].popped);

            if (Globals.DictationEnabled) {
                Speech.read(this.answers[this.bubbleSelection]);
            }

            this.wand.rotateTo(this.angles[this.bubbleSelection]);

            for (let bubble of this.bubbles) {
                bubble.selected = false;
                if (bubble === this.bubbles[this.bubbleSelection]) {
                    bubble.selected = true;
                }
                bubble.shrink();
                if (bubble.selected) {
                    bubble.enlarge();
                }
            }

            if (Globals.SoundEnabled) {
                tones.play(this.notes[this.bubbleSelection], this.octaves[this.bubbleSelection]);
            }
        }
    },

    rotateCCW: function() {
        if (!this.tutorial_running) {
            this.score_selectors++;

            do {
                if (this.bubbleSelection - 1 < 0) {
                    this.bubbleSelection = this.questions.length - 1;
                } else {
                    this.bubbleSelection = this.bubbleSelection - 1;
                }
            } while (!this.won && this.bubbles[this.bubbleSelection].popped);

            if (Globals.DictationEnabled) {
                Speech.read(this.answers[this.bubbleSelection]);
            }

            this.wand.rotateTo(this.angles[this.bubbleSelection]);

            for (let bubble of this.bubbles) {
                bubble.selected = false;
                if (bubble === this.bubbles[this.bubbleSelection]) {
                    bubble.selected = true;
                }
                bubble.shrink();
                if (bubble.selected) {
                    bubble.enlarge();
                }
            }

            if (Globals.SoundEnabled) {
                tones.play(this.notes[this.bubbleSelection], this.octaves[this.bubbleSelection]);
            }
        }
    },

    Select: function() {
        if (this.tutorial_running) {
            this.tutorial_state_idx += 1;
            if (this.tutorial_state_idx == this.tutorial_states.length) {
                this.tutorial_running = false;
            }
            if (this.tutorial_running) {
                this.tutorial_states[this.tutorial_state_idx].callback();
            }
        } else {
            let result = eval(this.questions[this.questionIndex]);
            let given = eval(this.answers[this.bubbleSelection]);
            if (given === result) {
                this.score += ((100) * this.score_multiplier) * Math.max(1, 12 - this.score_selectors);
                this.score_multiplier += 1;
                this.score_selectors = 0;

                this.bubbles[this.bubbleSelection].sprite.animations.play('bubble-pop');
                this.bubbles[this.bubbleSelection].popped = true;
                this.bubbles[this.bubbleSelection].numText.visible = false;

                this.questionIndex ++;
                this.incorrectCounter = 0;

                this.updateProgressBar();

                if (Globals.SoundEnabled) {
                    this.sounds['pops'][this.game.rnd.integerInRange(0, this.sounds.pops.length - 1)].play();
                }

                if (this.questionIndex === this.questions.length) {
                    if (Globals.SoundEnabled) {
                        this.sounds['win'].play();
                    }
                    this.won = true;
                    this.Esc();
                    return;
                }

                if (Globals.DictationEnabled) {
                    Speech.readEq(this.questions[this.questionIndex]);
                }
            } else {
                if (Globals.SoundEnabled) {
                    this.sounds['wrong'].play();
                }

                this.score_multiplier = 1;
                this.incorrectCounter++;
            }
        }
    },

    Esc: function() {
        this.game.state.start("bootMainMenu");
    },
};

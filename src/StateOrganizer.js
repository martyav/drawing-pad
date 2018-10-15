export default class StateOrganizer {
    constructor() {
        // Without `this`, these properties are kept inside the constructor and are inaccessible elsewhere, making them essentially private
        let _color = '#000000';
        let _background = 'white';
        let _width = 10;
        let _nib = 'round';
        let _isDrawing = false;
        let _lastX = 0;
        let _lastY = 0;
        let _pointsToStroke = [];
        let _imageData;
    
        // Timer state
        let _isCounting = false;
        let _time = 0;
        let _throttle = 1000;
        let _timeLimit = 60000;
        let _interval;
    
        // Prompt state
        let _promptKey = 'all';
        let _prompts;

        // Getters 
        this.getColor = () => _color; 
        this.getBackground = () => _background;
        this.getWidth = () => _width;
        this.getNib = () => _nib;
        this.getIsDrawing = () => _isDrawing;
        this.getPointsToStroke = () => _pointsToStroke;
        this.getFirstX = () => _pointsToStroke[0].x;
        this.getFirstY = () => _pointsToStroke[0].y;
        // LastX & lastY are separate from the points array because they are based on the user moving their cursor, with or without drawing
        this.getLastX = () => _lastX;
        this.getLastY = () => _lastY;
        this.getImageData = () => _imageData;
        this.getIsCounting = () => _isCounting;
        this.getTime = () => _time;
        this.getThrottle = () => _throttle;
        this.getTimeLimit = () => _timeLimit;
        this.getInterval = () => _interval;
        this.getPromptKey = () => _promptKey;
        this.getPrompts = () => _prompts;

        // Setters
        this.setColor = function(color) {
            if (typeof color !== 'string' || color[0] !== "#" || color.length !== 7 || isNaN(parseInt(color.slice(1), 16))) throw new TypeError(`Not a valid color hex code: ${ color }`);

            _color = color;
        }
        
        this.setWidth = function(width) {
            if (typeof parseInt(width) !== 'number') throw new TypeError(`Not a valid width: ${ width }`);
            if (width < 1 || width > 100) throw new RangeError(`Width is not in range: ${ width }`);

            _width = width;
        }
        
        this.setNib = function(nib) {
            if (typeof nib != 'string') throw new TypeError(`Not a valid nib: ${ nib }`);
            
            if (nib === 'square' || nib === 'round') {
                _nib = nib;
            } else {
                throw new Error(`Nib must be either square or round: ${ nib }`);
            }
        }
        
        this.setIsDrawing = function(isDrawing) {
            if (typeof isDrawing != 'boolean') throw new TypeError(`Not a valid isDrawing value: ${ isDrawing }`);

            _isDrawing = isDrawing;
        }
        
        this.addPoint = function(point) {
            if (!point.x || !point.y || typeof point.x !== 'number' || typeof point.y !== 'number') throw new TypeError(`Arg lacks valid coordinate values: x ${ point.x } y ${ point.y }`);

            _pointsToStroke.push({ x: point.x, y: point.y });
        }
        
        this.clearPoints = () => _pointsToStroke.length = 0;
        
        this.setLastX = function(x) {
            if (typeof x !== 'number') throw new TypeError(`Not a number: ${ x }`);

            _lastX = x;
        }

        this.setLastY = function(y) {
            if (typeof y !== 'number') throw new TypeError(`Not a number: ${ y }`);

            _lastY = y;
        }

        this.setImageData = function(imageData) {
            if (typeof imageData != 'string' || !imageData.startsWith('data:image/png;base64,')) throw new TypeError(`Not a valid image data URI: ${ imageData }`);

            _imageData = imageData;
        }

        this.setTime = function(time) {
            if (typeof time !== 'number') throw new TypeError(`Not a valid time: ${ time }`);
            if (time < 0 || time > _timeLimit) throw new RangeError(`Time not in range: ${ time }`);

            _time = time;
        }

        this.resetTime = () => _time = _timeLimit;

        this.decrementTime = () => _time -= _throttle;
        
        this.setIsCounting = function(isCounting) {
            if (typeof isCounting != 'boolean') throw new TypeError(`Not a valid isDrawingValue: ${ isCounting }`);

            _isCounting = isCounting;
        }

        this.clearInterval = () => clearInterval(_interval);

        this.setInterval = function(interval) {
            if (typeof interval != 'number') throw new TypeError(`Not a valid interval value: ${ interval }`);
            if (interval < 0 || interval > _timeLimit) throw new RangeError(`Interval is out of range ${ interval }`);

            _interval = interval;
        }

        this.setPromptKey = function(key) {
            if (typeof key != 'string') throw new TypeError(`Not a valid prompt list key: ${ key }`);
            
            if (key === 'all' || key === 'fun' || key === 'serious') {
                _promptKey = key;
            } else {
                throw new Error(`The only valid prompt list values are fun, serious, or all: ${ key }`);
            }
        }

        this.setPrompts = function(prompts) {
            if (!prompts.fun || !prompts.serious || !prompts.all) throw new TypeError(`Prompts must include keys for all, serious, and fun: ${ prompts }`);

            _prompts = prompts;
        }
    }
};
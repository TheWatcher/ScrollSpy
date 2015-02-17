/*
---
description:     ScrollSpy

authors:
  - David Walsh (http://davidwalsh.name)
  - Chirs Page (http://www.starforge.co.uk)

license:
  - MIT-style license

requires:
  core/1.2.1:   '*'

provides:
  - ScrollSpy
...
*/
var ScrollSpy = new Class({

	/* implements */
	Implements: [Options,Events],

	/* options */
	options: {
		max: 0,
		min: 0,
        buffer: 150,
		mode: 'vertical'/*,
		onEnter: $empty,
		onLeave: $empty,
		onScroll: $empty,
		onTick: $empty
		*/
	},

	/* initialization */
	initialize: function(container, options) {
		/* set options */
		this.setOptions(options);
		this.container = document.id(container);
		this.enters = this.leaves = 0;
		this.inside = false;

        /* if no min or max have been set, but a buffer has, work out the min
         * using the size of the container, and the configured buffer.
         */
        if(!this.options.min && !this.options.max && this.options.buffer) {
            this.calculateMin();
        }

		/* make it happen */
		this.start();
	},

    listener: function(e) {
		/* if it has reached the level */
		var position = this.container.getScroll(),
			xy = position[this.options.mode == 'vertical' ? 'y' : 'x'];

        /* if we reach the minimum and are still below the max... */
		if(xy >= this.options.min && (this.options.max == 0 || xy <= this.options.max)) {

			/* trigger enter event if necessary */
			if(!this.inside) {
				/* record as inside */
				this.inside = true;
				this.enters++;

				/* fire enter event */
				this.fireEvent('enter', [position, this.enters, e]);
			}

			/* trigger the "tick", always */
			this.fireEvent('tick', [position, this.inside, this.enters, this.leaves, e]);

        /* trigger leave */
		} else if(this.inside){
			this.inside = false;
			this.leaves++;
			this.fireEvent('leave', [position, this.leaves, e]);
		}

		/* fire scroll event */
		this.fireEvent('scroll', [position, this.inside, this.enters, this.leaves, e]);
	},

	/* starts the listener */
	start: function() {
		this.container.addEvent('scroll', this.listener.bind(this));
	},

	/* stops the listener */
	stop: function() {
		this.container.removeEvent('scroll', this.listener);
	},

    /** Update the scroll boundaries, and optionally reset the enter and leave
     *  counters.
     *
     */
    update: function(min, max, reset) {
        if(min !== undefined) this.options.min = min;
        if(max !== undefined) this.options.max = max;
        if(reset)  this.enters = this.leaves = 0;

        /* If the caller hasn't specified the boundaries, recalculate the min. */
        if(min === undefined && max === undefined && this.options.buffer) {
            this.calculateMin();
        }

        this.listener();
    },

    /** Update the minimum boundary based on the container size and the
     *  configured buffer. This is a convenience function to allow ScrollSpy
     *  to automatically calculate the minimum boundary for scroll hot area.
     */
    calculateMin: function() {
        if(this.options.mode == 'vertical') {
            this.options.min = this.container.getScrollSize().y - this.container.getSize().y - this.options.buffer;
        } else {
            this.options.min = this.container.getScrollSize().x - this.container.getSize().x - this.options.buffer;
        }
    }
});

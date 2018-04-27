var Dash = React.createClass({
	getInitialState: function () {
		return {
			rpm: 0,
			mph: 0,
			coolantTemp: 0,
			opts: [],
			dash: "defaultDash",
			drawer: false
		};
	},
	componentDidMount: function () {
		var that = this;
		this.socket = io();
		this.socket.on('ecuData', function (data) {
			that.setState({ rpm: data.rpm });
			that.setState({ mph: data.mph });
			that.setState({ coolantTemp: data.coolantTemp });
		});
		this.socket.emit('fetchComments');
	},
	needlePosition: function (rpm) {
		percentRPM = rpm / 12000 * 360 + 90;
		needleStyle = {
			transform : 'rotate(' + percentRPM + 'deg)'
		};
		return needleStyle;
	},
	rpmMarker: function (num, background) {
		var rotatePercent = num / 100 * 360 + 180
		tickStyle = {
			transform : 'rotate(' + rotatePercent + 'deg)'
		}
		var divClass = !background ? "rpm__marker" : "rpm__marker--background"
		return (
			<div style={tickStyle} className={divClass}></div>
			);
	},
	renderGauge: function() {
		return (
			<div id="gauge1">
				<canvas width="380" height="380" id="canvas1"></canvas>
				<div id="preview-textfield"></div>
			</div>
		);
	},

	rpmMarkers: function () {
		var percentRPM = this.state.rpm / 120;
		var rpmMarkers = []
		var background = false
		for (var i = 0; i < 75; i++) {
			if (i > percentRPM ){
				background = true
			}
			rpmMarkers.push(this.rpmMarker(i, background));
		}
		return rpmMarkers;
	},
	renderMPH: function () {
		var mph = this.state.mph;
		return (
			<div className="mph__container">
				<div className="mph"><span>{mph}</span></div>
				<p className="mph__label">MPH</p>
			</div>
		);
	},
	renderSmallNumbers: function (number) {
		var rpm = number;
		return (
			<div className="rpm-num__container">
				<div className="rpm"><span>{rpm}</span></div>
				
			</div>
		);
	},
	tempMarker: function (num, background) {
		var divClass = !background ? "temp__marker" : "temp__marker--background"
		var colors = ["#7BE7EC", "#89E8DC", "#96E9CE", "#A0EAC1", "#ABEBB4", "#BAEDA4", "#C5ED96", "#D1EE88", "#DDF07B", "#ECF16A", "#F0E966", "#F0DD68", "#F1D069", "#F2C36B", "#F3C36B", "#F4AA6E", "#F49D6F", "#F58F71", "#F58372", "#F77674"]
		style = {}
		if (!background){
			style = {
				backgroundColor : colors[num-1]
			}
		}
		return (
			<div style={style} className={divClass}></div>
			);
	},
	tempMarkers: function (temp) {
		tempPercent = temp / 210 * 20
		var tempMarkers = []
		background = true;

		for (var i = 20; i > 0; i = i - 1) {
			if (tempPercent > i){
				background = false;
			}
			tempMarkers.push(this.tempMarker(i, background));
		}
		return tempMarkers;
	},
	backgroundTempMarkers: function () {
		var tempMarkers = []
		for (var i = 0; i < 20; i++) {
			tempMarkers.push(this.tempMarker(i, true));
		}
		return tempMarkers;
	},
	defaultDash: function () {
		rpmClasses = 'rpm__container'
		if (this.state.rpm > 6000) rpmClasses += ' rpm__container--redline';
		return (
			<span className='neon-dash-container'>
				<div className={rpmClasses}>
					{ this.rpmMarkers() }
					{ this.renderMPH() }
					{ this.renderGauge() }
				</div>
				<div className="small-num__container">
						{ this.renderSmallNumbers(this.state.rpm) }
						<p className="small-number__label">RPM</p>
				</div>
				<div className="temp__container">
						{this.tempMarkers(this.state.coolantTemp)}
				</div>
			</span>
		);
	},
	numbersDash: function () {
		return (
			<span className='neon-dash-container'>
				<ul>
					<li className='rpm-column'>
						{ this.renderSmallNumbers(this.state.rpm) }
						<p className="small-number__label">RPM</p>
					</li>
					<li className='mph-column'>
						{ this.renderMPH() }
					</li>
					<li className='temp-column'>
						{ this.renderSmallNumbers(this.state.coolantTemp) }
						<p className="small-number__label">Coolant Temp</p>
					</li>
				</ul>
			</span>
		);
	},
	chooseDash: function (dashChoice) {
		var dash = {}
		this.state.dash = dashChoice;
		switch (dashChoice) {
		  case "defaultDash":
		    dash = this.defaultDash();
		    break;
			case "numbersDash":
				dash = this.numbersDash();
				break;
		  default:
		    dash = this.defaultDash();
		}
		return (
			dash
		);
	},
	chooseDashCloseDrawer: function (dashChoice) {
		this.state.drawer = !this.state.drawer;
		this.chooseDash(dashChoice);
	},
	toggleDrawer: function (dashChoice) {
		this.state.drawer = !this.state.drawer;
	},

	render: function() {
		drawerClass = 'dash-changer__container'
		if ( this.state.drawer ) drawerClass += ' open'

		return (
			<div className="content-container">

				{this.chooseDash(this.state.dash)}
				{<div className={drawerClass}>
					<a className="drawer-toggle drawer-toggle--open" onClick={this.toggleDrawer}><img className='dash-icon' src='./dashIcon.svg'/></a>
					<a className="drawer-toggle drawer-toggle--close" onClick={this.toggleDrawer}><img className='close-icon' src='./close.svg'/></a>
					<a className="dash-button" onClick={() => this.chooseDashCloseDrawer('defaultDash')}>Default Dash</a>
					<a className="dash-button" onClick={() => this.chooseDashCloseDrawer('numbersDash')}>Race Dash</a>
					<a className="dash-button" onClick={() => this.chooseDashCloseDrawer('numbersDash')}>Derp Mode</a>
				</div>}
			</div>
		);
	}
});

React.render(
	<Dash/>,
	document.getElementById('content')
);

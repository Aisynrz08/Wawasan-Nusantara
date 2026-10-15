const C3 = self.C3;
self.C3_GetObjectRefTable = function () {
	return [
		C3.Plugins.Sprite,
		C3.Behaviors.Platform,
		C3.Behaviors.scrollto,
		C3.Behaviors.solid,
		C3.Plugins.Keyboard,
		C3.Plugins.Shape3D,
		C3.Behaviors.Tween,
		C3.Behaviors.LOS,
		C3.Behaviors.MoveTo,
		C3.Plugins.Text,
		C3.Behaviors.Anchor,
		C3.Behaviors.jumpthru,
		C3.Behaviors.Timer,
		C3.Plugins.Button,
		C3.Plugins.HTMLElement,
		C3.Plugins.Button.Cnds.OnClicked,
		C3.Plugins.System.Acts.GoToLayout,
		C3.Plugins.System.Cnds.OnLayoutStart,
		C3.Plugins.Sprite.Acts.StopAnim,
		C3.Plugins.Sprite.Acts.SetAnim,
		C3.Plugins.Sprite.Acts.StartAnim
	];
};
self.C3_JsPropNameTable = [
	{Platform: 0},
	{ScrollTo: 0},
	{player: 0},
	{Solid: 0},
	{Sprite: 0},
	{Keyboard: 0},
	{content: 0},
	{Tween: 0},
	{LineOfSight: 0},
	{MoveTo: 0},
	{box: 0},
	{Anchor: 0},
	{DebugText: 0},
	{moved: 0},
	{yLen: 0},
	{Jumpthru: 0},
	{Timer: 0},
	{lift: 0},
	{MenuButtons: 0},
	{idMateri: 0},
	{fragmens: 0},
	{dummy: 0},
	{fragmenPanel: 0},
	{Dialogue: 0},
	{DialogAction: 0},
	{DialogConfirmed: 0}
];

self.InstanceType = {
	player: class extends self.ISpriteInstance {},
	Sprite: class extends self.ISpriteInstance {},
	Keyboard: class extends self.IInstance {},
	box: class extends self.I3DShapeInstance {},
	DebugText: class extends self.ITextInstance {},
	lift: class extends self.ISpriteInstance {},
	MenuButtons: class extends self.IButtonInstance {},
	fragmens: class extends self.ISpriteInstance {},
	dummy: class extends self.IHTMLElementInstance {},
	fragmenPanel: class extends self.IHTMLElementInstance {},
	Dialogue: class extends self.IHTMLElementInstance {}
}
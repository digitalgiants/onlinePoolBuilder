var keyCounter = 0

var Model = {
	currentBase: 1024,
	diskCount: null,
	rigs: [],
	RaidTen: function() {
	},
	RaidSixty: function() {
		switch(diskCount) {
			case totalDisks > 16 && totalDisks < 34:
				diskCount = diskCount - 5
				break;
			case totalDisks > 33 && totalDisks < 50:
				diskCount = diskCount - 7
				break;
			case totalDisks > 49 && totalDisks < 66:
				diskCount = diskCount - 9
				break;
			case totalDisks > 65 && totalDisks < 82:
				diskCount = diskCount - 11
				break;
			case totalDisks > 81 && totalDisks < 98:
				diskCount = diskCount - 13
				break;
			case totalDisks > 97 && totalDisks < 114:
				diskCount = diskCount - 15
				break;
			case totalDisks > 113 && totalDisks < 130:
				diskCount = diskCount - 17
				break;
			case totalDisks > 129 && totalDisks < 146:
				diskCount = diskCount - 19
				break;
			case totalDisks > 145 && totalDisks < 162:
				diskCount = diskCount - 21
				break;
			case totalDisks > 161:
				diskCount = diskCount - 23
				break;
		}
	},
	changeBase: function () {
		Model.currentBase = Model.currentBase === 1024 ? 1000 : 1024	
	},
	newRig: function () {
		Model.rigs.push({key: keyCounter++, shelves: []})
	},
	setHead: function (rig, e) {
		rig.head = null
		rig.shelves = []
		requestAnimationFrame(function(){
			rig.head = Model.threeSeries.arrays.concat(Model.fourSeries.arrays).find(function (obj) {
				return obj.unit === e.target.value
			})
			m.redraw()
		})
	},
	shelfChoices: function (head) {
		var s3 = Model.threeSeries.arrays.find(function (obj) {
			return obj === head
		})
		if (s3) return Model.threeSeries.shelves
		return Model.fourSeries.shelves
	},
	selectShelf: function (rig, shelf, idx) {
		rig.shelves[idx].obj = Model.threeSeries.shelves.concat(Model.fourSeries.shelves).find(function (obj) {
			return obj.unit === shelf
		})
	},
	addShelf: function (rig) {
		rig.shelves.push({ key: keyCounter++ })
	},
	removeShelf: function (rig, idx) {
		rig.shelves.splice(idx, 1)
	},
	getData: function () {
		m.request({
			url: '../data/arrays_perf.json'
		})
		.then(function (data) {
			Model.threeSeries = data.threeSeries
			Model.fourSeries = data.fourSeries
		})
	}, 
	specTotal: function (spec, rig) {
		if (rig.head === null) return 0
		return rig.shelves.reduce(function (accum, current) {
			return accum + (current.obj ? (current.obj[spec] || 0) : 0) 
		}, rig.head[spec] || 0)
	},
	deleteRig: function (idx) {
		if (confirm('Are you sure?')) {
			Model.rigs.splice(idx, 1)
		}
	},
}

var HeadSelector = {
	view: function (vnode) {
		var sr = [Model.threeSeries, Model.fourSeries]
		return m('select'
			, {	onchange: Model.setHead.bind(null, vnode.attrs.rig) }
			, m('option[selected][disabled]', '—— Choose a Head ——')
			, sr.map(function (series, idx) {
				return [
					, m('option[disabled]')
					, m('option[disabled]', '——  ' + (idx ? '4' : '3') + '000 Series  ——')
					, series.arrays.map(function (head) {
						return m('option', head.unit)
					})
				]
			})
		)
	}
}

var Shelves = {
	view: function (vnode) {
		var rig = vnode.attrs.rig
		return m('.shelves'
			, m('button.add'
				, {
					disabled: rig.shelves.length > 5,
					onclick: Model.addShelf.bind(null, rig)
				}
				, 'add shelf'
			)
			, rig.shelves.map(function (shelf, idx) {
				return m('.shelf'
					, { key: shelf.key }
					, m('select'
						, { onchange: function (e) { Model.selectShelf(rig, e.target.value, idx) } }
						, m('option[selected][disabled]', '—— Select Shelf ——')
						, Model.shelfChoices(rig.head).map(function (shelf) {
							return m('option', shelf.unit)
						})
					)
					, m(''
					, m('button.poolA', 'A')
					, m('button.poolB', 'B')
					, m('button.remove', { onclick: Model.removeShelf.bind(null, rig, idx) }, '—'))
				)
			})
		)
	}
}

var Specs = {
	view: function (vnode) {
		var rig = vnode.attrs.rig
		return m('.specs'
			, m('', 'Pool Type')
			, m('', 'Raid Type')
			, m('', 'Workload')
			, m('', 'Data Reduction')
			, m('', 'IOPS')
			, m('', 'DRAM (GB)')
			, m('', 'NVDIMM (GB)')
			, m('', 'Weight: ' + Model.specTotal('weight', rig))
			, m('', 'Amps: ' + Model.specTotal('amps', rig))
			, m('', 'Racks: ' + Model.specTotal('ru', rig))
			, m('', 'HDDs: ' + Model.specTotal('hdds', rig))
			, m('', 'SSDs: ' + Model.specTotal('ssds', rig))
			, m('', 'Raw Meta/Cache (TB): ')
			, m('', 'Raw Capacity (TB): ')
			, m('', 'Usable Capacity: ' )
			, m('', 'Effective Capacity')
			, m('button', { onclick: Model.changeBase }, 'Change BaseType')
		)
	} 
}

//pool a biznizz
var PoolA = {
	view: function (vnode) {
		var rig = vnode.attrs.rig
		return m('.poolA'
			, m('', 'Pool A Info')
			, m('button', 'R10')
			, m('button', 'R60')
			, m('select'
			, m('option', 'workload'))
			, m('input', 'data redux')
			, m('', 'IOPS')
			, m('', 'DRAM (GB)')
			, m('', 'NVDIMM (GB)')
			, m('', 'Weight: ')
			, m('', 'Amps: ')
			, m('', 'Racks: ')
			, m('', 'HDDs: ')
			, m('', 'SSDs: ')
			, m('', (Model.specTotal('ssdSize', rig) * Model.specTotal('ssds', rig)) / Model.currentBase)
			, m('', (Model.specTotal('hddSize', rig) * Model.specTotal('hdds', rig)) / Model.currentBase)
			, m('', 'Usable Capacity: ' )
			, m('', 'Effective Capacity')
		)
	}
}

// pool B biznizz
var PoolB = {
	view: function (vnode) {
		var rig = vnode.attrs.rig
		var diskCountB = Model.specTotal('hdds', rig)
		return m('.poolB'
			, m('', 'Pool B Info')
			, m('button', 'R10')
			, m('button', 'R60')
			, m('select'
			, m('option', 'workload'))
			, m('input', 'data redux')
			, m('', 'IOPS')
			, m('', 'DRAM (GB)')
			, m('', 'NVDIMM (GB)')
			, m('', 'Weight: ')
			, m('', 'Amps: ')
			, m('', 'Racks: ')
			, m('', 'HDDs: ')
			, m('', 'SSDs: ')
			, m('', (Model.specTotal('ssdSize', rig) * Model.specTotal('ssds', rig)) / Model.currentBase)
			, m('', (Model.specTotal('hddSize', rig) * Model.specTotal('hdds', rig)) / Model.currentBase)
			, m('', 'Usable Capacity: ' )
			, m('', 'Effective Capacity')
		)
	}
}

//delete after using
var diskCountValidation = {
	view: function() {
		var a = null
		var b = null
		return m('.validate'
			, m('input.disks')
			, m('button', {
				onclick: function() {
					a = document.querySelector('.disks').value
					a % 2 == 0 ? b=(a/2)-1 : b=Math.floor(a/2)
				} 
			}, 'Disk Validation')
	)
	}
}

var App = {
	oncreate: Model.getData,
	view: function(){
		return m('main'
			, m('.new-rig', m('button.add', { onclick: Model.newRig }, 'New Rig'))
			, Model.threeSeries && Model.rigs.map(function (rig, idx) {
				var attrs = { rig: rig }
				return m('.rig'
					, { key: rig.key }
					, m(HeadSelector, attrs)
					, rig.head && [
						, m(Shelves, attrs)
						, m(Specs, attrs)
						, m(PoolA, attrs)
						, m(PoolB, attrs)
						
					]
					, m('button.delete-rig', { onclick: Model.deleteRig.bind(null, idx) }, 'delete rig')
				)
			})
			, m(diskCountValidation)
				// , m(HeadSelector)
				// , Model.heads.map(function (head) {
				// 	if (!head) return null
				// 	return [
				// 		, m(Shelves)
				// 		, m(Specs, { head: head })
				// 	]
				// })
		)
	}
}

m.mount(document.body, App)
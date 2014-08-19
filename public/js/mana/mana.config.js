(function(manaGlobal, manaCommon, manaGraph){

/* member variables in manaCommon  */
manaCommon.DEBUG = true;

manaCommon.API_URL = '';

manaCommon.API_PARTS = {
    data: {

    },

    apps: {
    },
    
    users: {
    }
};

manaCommon.ACTIVE_APP_KEY = 0;


manaCommon.DASHBOARD_REFRESH_MS = 10 * 1000;
manaCommon.DASHBOARD_IDLE_MS = 3000 * 1000;
/* manaCommon END */


/* manaGlobal */
manaGlobal['app'] =  ['game01', 'doc02'];
/* manaGlobal END */

store.set("mana_date", 'hour');


manaGraph['GRAPH_COLORS'] = [ "#88BBC8", "#ED8662", "#A0ED62", "#ed6262", "#edb762", "#ede262", "#62edb0", 
			      "#62beed", "#6279ed", "#c162ed", "#ed62c7", "#9A1B2F"];


})(window.manaGlobal = window.manaGlobal || {}, window.manaCommon = window.manaCommon ||{},
   window.manaGraph = window.manaGraph || {})

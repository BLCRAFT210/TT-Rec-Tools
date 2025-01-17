//
// All things that need to happen on page load
//

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/" + "; SameSite=Strict";
}

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }

document.addEventListener("DOMContentLoaded", function() {

    update_import_table(true);
    update_license_table(-1, '', true);

    // fetch iso cookie and set the right region
    var iso_cookie = getCookie("rksys_region");
    if (iso_cookie != "") {
        document.getElementById("region-selector").value = iso_cookie;
    }

    const tabSelector = document.querySelectorAll('.tabs li');
    tabSelector.forEach(function(tabObject) {
        tabObject.onclick = () => {
            if (!DOWNLOADING_GHOSTS) { // don't allow tab switching when ghosts are being downloaded
                tabSelector.forEach(function(tabObject2) {tabObject2.classList.remove('is-active');})
                tabObject.classList.add('is-active');
                update_chosen_license(CURRENT_LICENSE, tabObject.id);
            }
        }
    })

    const rksysFileInput = document.querySelector('#rksys input[type=file]');
    rksysFileInput.onchange = () => {
        if (rksysFileInput.files.length > 0) {
            const fileName = document.querySelector('#rksys .file-name');
            read_rksys_file(fileName, rksysFileInput.files);
        }
    };

    const rkgFileInput = document.querySelector('#rkg-button input[type=file]');
    rkgFileInput.onchange = () => {
        if (rkgFileInput.files.length > 0) {
            read_rkg_files(rkgFileInput.files);
        }
    };

    const saveButton = document.querySelector('#import-save-butt');
    saveButton.onclick = async () => {
        if (RKSYS.length != 0) {
            await save_and_download_save();
        }
    };

    const region_selector = document.querySelector('#region-selector');
    region_selector.onchange = () => {
        var selected_value = region_selector.value;
        setCookie("rksys_region", selected_value, 1000);
    };

    const miniButtons = document.querySelectorAll('.mini');
    miniButtons.forEach(function(miniButton) {
        miniButton.onclick = () => {
            if (!DOWNLOADING_GHOSTS) {
                const index = parseInt(miniButton.id.split('-')[1]) - 1;
                const active_tab = document.querySelector('#license li.is-active');
                update_chosen_license(index, active_tab.id);
            }
        }
    })

    const deleteButton = document.getElementById('delete-button');
    deleteButton.onclick = () => {
        if (!DOWNLOADING_GHOSTS) {
            const active_tab = document.querySelector('#license li.is-active');
            delete_selected_ghosts(active_tab.id);
        }
    }

    const exportButton = document.getElementById('export-button');
    exportButton.onclick = async () => {
        const active_tab = document.querySelector('#license li.is-active');
        await zip_and_download_ghosts(active_tab.id);
    }

    const importButton = document.getElementById('import-button');
    importButton.onclick = () => {
        if (!DOWNLOADING_GHOSTS) {
            const active_tab = document.querySelector('#license li.is-active');
            import_ghosts(active_tab.id);
        }
    }

    const urlButton = document.getElementById('url-button');
    urlButton.onclick = () => {
        if (!DOWNLOADING_GHOSTS) {
            const active_tab = document.querySelector('#license li.is-active');
            parseURL(document.getElementById("url-input").value);
        }
    }

    //also submits url with enter key
    const urlInput = document.getElementById('url-input');
    urlInput.addEventListener("keyup",function(event) {
        if (event.keyCode===13) {
            urlButton.click();
        }
    });

    // drag&drop functionality

    var rksysDropArea = document.getElementById('rksys');
    var rksysDropArea2 = document.getElementById('license');
    var rkgDropArea = document.getElementById('ghost-import');

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ;['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        rksysDropArea.addEventListener(eventName, preventDefaults, false);
        rksysDropArea2.addEventListener(eventName, preventDefaults, false);
        rkgDropArea.addEventListener(eventName, preventDefaults, false);
    })

    new Dragster(rksysDropArea);
    new Dragster(rksysDropArea2);
    new Dragster(rkgDropArea);

    document.addEventListener("dragster:enter", function (e) {
        e.target.classList.add("highlight");
    }, false );

    document.addEventListener("dragster:leave", function (e) {
        e.target.classList.remove("highlight");
    }, false );

    function handleRksysDrop(e) {
        rksysFileInput.files = e.dataTransfer.files;
        rksysFileInput.onchange();
        e.currentTarget.classList.remove("highlight");
    }

    function handleRKGDrop(e) {
        rkgFileInput.files = e.dataTransfer.files;
        rkgFileInput.onchange();
        e.currentTarget.classList.remove("highlight");
    }

    rksysDropArea.addEventListener('drop', handleRksysDrop, false);
    rksysDropArea2.addEventListener('drop', handleRksysDrop, false);
    rkgDropArea.addEventListener('drop', handleRKGDrop, false);
});
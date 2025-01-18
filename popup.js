
document.addEventListener('DOMContentLoaded', function() {
    var codeTextArea = document.getElementById('codeTextArea');
    var urlTextArea = document.getElementById('urlTextArea');
    var modelTextArea = document.getElementById('modelTextArea');
    // check llmRequest, if exists, load it. else load from llmRequest_template.txt
    chrome.storage.local.get('llmkey', function(result) {
        if (result.llmkey && result.llmkey.length > 0) {
            codeTextArea.value = result.llmkey;
        }
    });
    chrome.storage.local.get('llmurl', function (result) {
        if (result.llmurl && result.llmurl.length > 0) {
            urlTextArea.value = result.llmurl;
        }
    });
    chrome.storage.local.get('llmmodel', function (result) {
        if (result.llmmodel && result.llmmodel.length > 0) {
            modelTextArea.value = result.llmmodel;
        }
    });
    var saveButton = document.getElementById('saveButton');
    saveButton.addEventListener('click', savejs);
    // var defaultButton = document.getElementById('defaultButton');
    // defaultButton.addEventListener('click', function() {
    //     var xhr = new XMLHttpRequest();
    //     xhr.open('GET', 'llmRequest_template.txt', true);
    //     xhr.onreadystatechange = function() {
    //         if (xhr.readyState == 4 && xhr.status == 200) {
    //             codeTextArea.value = xhr.responseText;
    //         }
    //     };
    //     xhr.send();
    // });
});
function savejs(){
    chrome.storage.local.set(
        {
            llmkey: codeTextArea.value,
            llmurl: urlTextArea.value,
            llmmodel: modelTextArea.value
         },
        function () {
            alert('保存成功');
        }
    );
}

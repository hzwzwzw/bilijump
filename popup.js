
document.addEventListener('DOMContentLoaded', function() {
    var codeTextArea = document.getElementById('codeTextArea');
    // check llmRequest, if exists, load it. else load from llmRequest_template.txt
    chrome.storage.local.get('llmkey', function(result) {
        if (result.llmkey && result.llmkey.length > 0) {
            codeTextArea.value = result.llmkey;
        }
        // } else {
        //     var xhr = new XMLHttpRequest();
        //     xhr.open('GET', 'llmRequest_template.txt', true);
        //     xhr.onreadystatechange = function() {
        //         if (xhr.readyState == 4 && xhr.status == 200) {
        //             codeTextArea.value = xhr.responseText;
        //         }
        //     };
        //     xhr.send();
        // }
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
    chrome.storage.local.set({llmkey: codeTextArea.value}, function() {
        alert('保存成功');
    });
}
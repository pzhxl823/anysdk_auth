var http = require('http');
var async = require('async');

var oauth_host = "oauth.anysdk.com";
var oauth_path = "/api/User/LoginOauth/";

var resJson;
var login = function (req, res) {
    
    async.waterfall([function (cb) {
        
        // ���տͻ��˷��͹�����data
        var forwardData = '';
        req.addListener('data', function (chunk) {
            forwardData+= chunk;
        });
        req.addListener('end', function () {
            console.log("recv from client : \n\t" + forwardData);
            cb(0, forwardData);
        });

    }, function (forwardData, cb) { 
        
        // ת��data��anysdk�����շ���
        var options = {
            host: oauth_host,
            path: oauth_path,
            method: "post",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                "Content-Length": forwardData.length,
            }
        };

        console.log("send to anysdk :\n\t" + oauth_host + oauth_path);

        var reqToAnysdk = require("http").request(options, function (resFromAnysdk) {
            
            var anysdkReData_s = "";
            resFromAnysdk.setEncoding("utf8");
            resFromAnysdk.on("data", function (data) {
                anysdkReData_s += data;
            });
            resFromAnysdk.on("end", function () {
                console.log("#recv data from anysdk:\n\t" + anysdkReData_s);
                var anysdkReData = JSON.parse(anysdkReData_s);
                if (anysdkReData && (anysdkReData.status == "ok")) {
                    
                    // ���������Ĵ���
                    switch (anysdkReData.channel) {

                        case "000023": // 360
                            break;

                    }
                    
                    // ����ӷ���������
                    anysdkReData.ext = {
                        sk:12
                    }

                    cb(0, JSON.stringify(anysdkReData));

                } else {
                    cb(1, anysdkReData_s);
                }
            });

        });
        
        reqToAnysdk.write( forwardData );
        reqToAnysdk.end();

    }], function(err, anysdkReData_s) {
        
        // ���ؿͻ���
        console.log("return client :\n\t" + anysdkReData_s);
        res.write(anysdkReData_s);
        res.end();

    });

}

var server = http.createServer(login);
server.listen(3002);
console.log("listen on: 3002");

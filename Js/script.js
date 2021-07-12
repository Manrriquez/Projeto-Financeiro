function ConversaoMoeda(i) {
	var v = i.value.replace(/\D/g,'');
	v = (v/100).toFixed(2) + '';
	v = v.replace(".", ",");
	v = v.replace(/(\d)(\d{3})(\d{3}),/g, "$1.$2.$3,");  // Mascara do input, conversão de moeda
	v = v.replace(/(\d)(\d{3}),/g, "$1.$2,");
	i.value = v;
}

function validarCampo(e) {
    e.preventDefault()
    var error = false;

    var tipo = document.getElementById("option").value;
    var validacaoTipo = document.getElementById("validacaoTipo");
    if (tipo == "") {
        var error = true;
        validacaoTipo.innerHTML = "Selecione 'Compra ou Venda'";
    }

    var mercadoria = document.getElementById("mercadoria").value;
    var validacaoMercadoria = document.getElementById("validacaoMercadoria");
    if (mercadoria == "") {
        var error = true;
        validacaoMercadoria.innerHTML = "Preencha o campo mercadoria";
    }

    var valor = document.getElementById("valor").value;
    var validacaoValor = document.getElementById("validacaoValor");
    if (valor == "") {
        var error = true;
        validacaoValor.innerHTML = "Preencha o campo valor";
    }

    if (!error) {
        if (transacao == null) {
            transacao = []
        }
        transacao.push({ option: tipo, mercadoria: mercadoria, valor: valor })
        localStorage.setItem('transacao', JSON.stringify(transacao))
        listarTransacoes()
    }
}
function listarTransacoes() {
    transacao = JSON.parse(localStorage.getItem('transacao'))
    if (transacao != null) {
        document.querySelector('#content-table').innerHTML = transacao.map((trsc) => {
            return (
                `<tr>
                <td class='calc_symbol'>+</td>
                <td class='left'>`+ trsc.mercadoria + `</td>
                <td class='right'>R$ `+ trsc.valor + `</td>
            </tr>
            <tr>
                <td colspan="3" class="border"></td>
            </tr>`
            )
        }).join('')
        alterarSimbolo()
        listarTotal()
    }
}

function deletarTransacoes() {
    localStorage.removeItem('transacao')
    deleteApi()
    alert("Registros excluídos")                    //Função que exclui transações do localstorage
    window.location.reload()
    listarTransacoes()
}
var total = 0
function calculoValores() {
    let transacao = JSON.parse(localStorage.getItem('transacao'))
    let totalStrVenda = []
    let totalStrCompra = []                                //Função que calcula os dados fornecidos pelo formulario
    let totalNbrVenda = []
    let totalNbrCompra = []
    let totalVenda = 0
    let totalCompra = 0

    if (transacao != null) {
        for (let i = 0; i < transacao.length; i++) {
            if (transacao[i].option == "compra") {
                totalStrCompra = [transacao[i].valor.replace(/\D/g, '')]
                totalNbrCompra = Number.parseFloat(totalStrCompra)
                totalCompra += totalNbrCompra
            }
        }
        for (let j = 0; j < transacao.length; j++) {
            if (transacao[j].option == "venda") {
                totalStrVenda = [transacao[j].valor.replace(/\D/g, '')]
                totalNbrVenda = Number.parseFloat(totalStrVenda)
                totalVenda += totalNbrVenda
            }
        }
        total = totalVenda - totalCompra
    }
}
function formatarMoeda() {
    totalFormatado = total
    totalFormatado = totalFormatado + '';
    totalFormatado = parseInt(totalFormatado.replace(/[\D]+/g, ''));     // formata o "total" pra uma string com o formato de moeda
    totalFormatado = totalFormatado + '';
    totalFormatado = totalFormatado.replace(/([0-9]{2})$/g, ",$1");

}


function listarTotal() {
    calculoValores()
    formatarMoeda()
    var campoTotal = document.getElementById('campoTotal')
    campoTotal.innerHTML = "R$ " + totalFormatado;

    if (total > 0) {
        campoLucro.innerHTML = "[LUCRO]"
    }
    else if (total < 0) {
        campoLucro.innerHTML = "[PREJUIZO]"
    }
    else {
        campoLucro.innerHTML = ""
    }

}

var transacaoJson = JSON.parse(localStorage.getItem('transacao'))
function create(){
    alert('Requisição enviada')
    console.log(transacaoJson)
    fetch("https://api.airtable.com/v0/appRNtYLglpPhv2QD/Historico", {  // inserindo dados fornecidos pelo form na api
        method: "POST",
        headers: {
            Authorization: 'Bearer key2CwkHb0CKumjuM',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            records: [
                {
                    fields: {
                        Aluno: '9831',
                        Json: transacaoJson
                    }
                }
            ]
        })
    })
}

function update(){
    getId()
    fetch("https://api.airtable.com/v0/appRNtYLglpPhv2QD/Historico", {
        method: "PATCH",
        headers: { 
            Authorization: 'Bearer key2CwkHb0CKumjuM',         // atualizando dados na api
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            records: [
                {
                    id: idAluno,
                    fields: {
                        Aluno: '9831',
                        Json: transacaoJson
                    }           
                }
            ]
        })
    })
}

function deleteApi(){
    getId()
    var myHeaders = new Headers();
    myHeaders.append("Authorization", "Bearer key2CwkHb0CKumjuM");

    var requestOptions = {                                                        // funcao para deletar dados armazenados na api
        method: 'DELETE',
        headers: myHeaders,
        redirect: 'follow'
    };

    fetch("https://api.airtable.com/v0/appRNtYLglpPhv2QD/Historico/"+ idAluno, requestOptions)
    .then(response => response.text())
    .then(result => console.log(result))
    .catch(error => console.log('error', error));
}

//Chamar esta requisição para o historico no HTML
var resultJson = {}
function getJson(){
    fetch("https://api.airtable.com/v0/appRNtYLglpPhv2QD/Historico?maxRecords=&view=Grid%20view", {
        headers: {                                                                                    //Chamar esta requisição para o historico no HTML
            Authorization: 'Bearer key2CwkHb0CKumjuM'
        },
    }).then(response => response.json().then(result => {resultJson = result}))
}

var idAluno = ''
function getId(){

    for(let i = 0; i < resultJson.records.length; i++){          // recupera o id de entrada na api, diacordo com os ultimos digitos do cpf
        if(resultJson.records[i].fields.Aluno == "9831"){
            idAluno = resultJson.records[i].id;
        }
    }
}

var verification = true;
function trueOrFalse(){
    let i = 0
    for(; i < resultJson.records.length; i++){
        if(resultJson.records[i].fields.Aluno == "9831"){     // verificação de existençia de id na entrada da api
            verification = true;
        } else {
            verification = false;
        }
    }
}

function choiseFunction(){
    trueOrFalse()
    if(verification == false){           // verifica se o id do aluno ja existe, caso não, ele cria um novo
        create()
    } else {
        update()
    }
}
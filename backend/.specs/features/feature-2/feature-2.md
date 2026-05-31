Okay so now I'll need a couple of more complex functionalities.
I want you to add a new mongo database connection. I'll use atlas as a host.


- MongoDB creation. Add it to the list of databases I'll need

- MongoDB Cache Functionality: 

Audio Message 1 (In Portuguese): 
```txt
Eu queria que você adicionasse um no MongoDB, três esquemas. É, cada um desses esquemas aí vai ter, eh, por usuário com a música que está sendo analisada agora, entendeu? Tipo, o usuário vai estar logado, ele chamou uma música para analisar. E, daí, vai ter que ter um documento com o nome do usuário. E aí, vai ter que ter o, enfim, os dados, né? E que aí pode ser uma lista de dicionários ou seja lá o que for. Geralmente, é uma lista de dicionários. Aí, essa lista de dicionários que vai, enfim, ter ter a, ou análise por batida, ou análise por acorde, ou análise por sessão. Eh, mas sendo que assim, cada uma dessas três, desses três esquemas vai ser dedicado a ao a um tipo de análise, né? Análise por batida, análise por acorde, ou análise por sessão. E vai ser tipo assim, vai ser um cache mesmo. É como se fosse um cache, então, eh, toda vez que o usuário sair, ou ele dá logoff, ou então, ele, tipo, pesquisou outra música, esse documento tem que ser apagado. E, daí, eh, praticamente isso, é um cache.

*tl;dr:* Eu preciso adicionar três esquemas no MongoDB, um por usuário, para a música que está sendo analisada. Geralmente, é uma lista de dicionários, sendo uma análise por batida, por acorde ou por sessão. Cada esquema será dedicado a um tipo de análise e funcionará como um cache. Assim, quando o usuário fizer logoff ou pesquisar outra música, o documento deverá ser apagado.
```

- Song Analysis By AI (Using MongoDB's cache): 
Audio Message 2 (in Portuguese)
```txt
Aí, depois disso, eu vou querer que, enfim, esse esse dicionário aí, ele vai ser utilizado justamente porque, enfim, o usuário ele chamou em um dos endpoints essa análise, né?

Cê, beleza, ele chamou a análise, mas a análise vai ficar onde para depois a o você poder usar ela, entendeu? Sem ter que mandar, chamar a mesma função de novo.

Aí, beleza.

Eu quero agora que você pegue essa análise dentro do Mongo mesmo, que vai ter lá o último para o usuário, você vai ter o nome do usuário, né, que tá logado, tudo. Ah, com a sessão.

E pega essa última análise e você vai usar o novo método que eu adicionei na na biblioteca Music Reader, que é um método, deixa eu ver aqui.

É, tipo, tem esse Music Analytics Assistant, aí tem o método dele, Get Analysis. Aí você vai, tipo, tem um user prompt, que é um novo endpoint que você tem que criar agora, ele vai imputar uma prompt e vai ter o chords beat by beat, o section analysis e o chord grid, que eles vão ser esses três últimos parâmetros aí, você vai passar um argumento para eles que vai ser justamente os valores que estão lá no cache.

E daí vai ter uma análise lá que a API vai trazer e você traz de volta justamente essa análise.

Aí é praticamente isso, só realmente traz de volta a análise para retornar nesse endpoint a análise.

*tl;dr:* Eu quero que você pegue a última análise dentro do Mongo, usando o usuário que está logado e a sessão. Depois, utilize o novo método que eu adicionei na biblioteca Music Reader, o Get Analysis, passando a prompt e os parâmetros chords beat by beat, section analysis e o chord grid com os valores do cache. A API vai retornar uma análise e eu quero que você traga de volta exatamente essa análise no endpoint.
```



* I want you to apply a new rule which will be that whenever the user asks for data on songs/{song_name}/analytics, if any of the dictionary keys happen at all 
to have more than 50 records, you should cut that. I want you to do it like this:
```json
{
    "Chord Analysis": {
        "total": "This should be an integer, should represent the number of records that there is on this key",
        "offset": 0,
        "limit": 50,
        "data": [
            {"whatever was previously returned"}
        ]
    }
}
```
---------------------

The Idea is that, whenever the user calls an endpoint, you should FIRST verify if the data FOR THAT USER is or is not present on MongoDB, if it's not, THEN you go and you call the method that makes calls to the MusicReader internal library. I'm talking obviously about the get_song_analytics endpoint. You should add an offset, and a limit to it. Whoever will call this endpoint will have to look up the total key and then keep asking for more by increasing either the offset or limit

---------------------
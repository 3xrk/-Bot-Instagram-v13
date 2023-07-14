 const { Discord, Client, MessageEmbed, MessageActionRow, MessageButton, MessageAttachment, WebhookClient } = require("discord.js");
const client = new Client({ intents: 32767 });

const { token, prefix } = require('./config.json');
const { QuickDB } = require('quick.db');
const db = new QuickDB();
const { DiscordModal, ModalBuilder, ModalField } = require('discord-modal');

DiscordModal(client);

client.queue = new Map();

client.login(token);

client.on('ready', async () => {
  console.log(`Logado em [ ${client.user.username} ] com sucesso!✅`);
  console.log(`INSTAGRAM TA ONLINE`);
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (message.channel.type === 'dm') return;
  if (!message.content.toLowerCase().startsWith(prefix.toLowerCase())) return;

  const args = message.content.trim().slice(prefix.length).split(/ +/g);
  const command = args.shift().toLowerCase();

  console.log(`\n✅ O comando [ ${command} ] foi carregado com sucesso.`);

  try {
    const commandFile = require(`./commands/${command}.js`);
    commandFile.run(client, message, args);
  } catch (err) {
    // Tratar erro aqui
  }
});

//------------------------------------------------------------[ Sistema de Cl tipo Bot do Biel & Boss Bot ]---------------------------------------------------------------//

client.on('message', async (message) => {
  if (message.author.bot) return;
  if (message.content === "PALAVRA CHAVE") // SUBSTITUA "PALAVRA CHAVE" PELA MENSAGEM DE PREFERÊNCIA
 {
    const user = message.author;

    message.channel.messages.fetch({ limit: 100 }).then((messages) => {
      if (user) {
        const filteruser = user ? user.id : client.user.id;
        messages = messages.filter(m => m.author.id === filteruser);
      }

      message.channel.bulkDelete(messages).catch(error => {});
    });
  }

  //------------------------------------------------------------[ Caso alguém use "bb!cl" bot manda uma mensagem brincando 🙂]---------------------------------------------------------------//

  if (message.content === "bb!cl") {
    message.channel.send(`${message.author} eae parça bora parar de usar bb!cl, mo feio em... recomendo usar akkilinda`).then(m => {
      setTimeout(async () => {
        m.delete().catch(err => {});
      }, 30000);
    }).catch(err => {});
  }
});
      
 
//------------------------------------------------------------[instagram]---------------------------------------------------------------//
  
  client.on('messageCreate', async message => {
     if(message.author.bot) return
     if(!message.guild) return


      let canal = await db.get(`instagram_${message.guild.id}.canal`)
      let ativo = await db.get(`instagram_${message.guild.id}.ativo`)
  
      if(ativo == null ) return
      if(ativo == false ) return
     
  if(message.channel.id == canal) {
  message.delete()
      
      let imgs = message.attachments.map(m=>`${m.url}`)[0]
      
    
      if(!imgs) return message.channel.send({content:`  ${message.author}, Você deve enviar algum arquivo para postar.`}).then(m=>{
          setTimeout(()=>{m.delete()},10000)
      })
       
  
  
      let att = new MessageAttachment(imgs,`post-${message.author.username}`)
      let web = await db.get(`instagram_${message.guild.id}.webhook`)
      let webhook = new WebhookClient({url:web})
      webhook.edit({name:`${message.author.username}`, avatar:message.author.avatarURL()})
   webhook.send({ content: `${message.author}`,files:[att.attachment], components: [  new MessageActionRow().addComponents(
          new MessageButton()
          .setCustomId("curtir")
          .setLabel("0")
          .setStyle("SECONDARY")
          .setEmoji("❤️"),
          new MessageButton()
          .setCustomId("comentar")
          .setLabel("0")
          .setStyle("SECONDARY")
          .setEmoji("💭"),
          new MessageButton()
          .setCustomId("vcurtidas")
          .setStyle("SECONDARY")
          .setEmoji("💞"),
          new MessageButton()
          .setCustomId("vcomentarios")
          .setStyle("SECONDARY")
          .setEmoji("💬"),
          new MessageButton()
          .setCustomId("del")
          .setStyle("SECONDARY")
          .setEmoji("🗑️"),
      )] }).then(async msg=>{
          await db.set(`post_${msg.id}.curtidas`,[])
          await db.set(`post_${msg.id}.comentarios`,[])
          await db.set(`post_${msg.id}.curtidas`,[])
          await db.set(`post_${msg.id}.author`,message.author.id)
  })
  
  
  
  }
  })
  client.on('interactionCreate', async inter => {
      if(!inter.isButton()) return
      if(inter.customId == "curtir") {
          let dbu = await db.get(`post_${inter.message.id}_${inter.user.id}.curtir`)
  if(!dbu) {
              let u =   await db.get(`post_${inter.message.id}.author`)
              await db.push(`post_${inter.message.id}.curtidas`,[`${inter.user.id}`])
              await db.set(`post_${inter.message.id}_${inter.user.id}.curtir`,true)
              let user = client.users.cache.get(u)
              let comentarios = await db.get(`post_${inter.message.id}.comentarios`)
              let curtidas = await db.get(`post_${inter.message.id}.curtidas`)
              let web = await db.get(`instagram_${inter.guild.id}.webhook`)
              let webhook = new WebhookClient({url:web})
              webhook.editMessage(inter.message.id,{components: [  new MessageActionRow().addComponents(
                  new MessageButton()
                  .setCustomId("curtir")
                  .setLabel(`${curtidas.length}`)
                  .setStyle("SECONDARY")
                  .setEmoji("❤️"),
                  new MessageButton()
                  .setCustomId("comentar")
                  .setLabel(`${comentarios.length}`)
                  .setStyle("SECONDARY")
                  .setEmoji("💭"),
                  new MessageButton()
                  .setCustomId("vcurtidas")
                  .setStyle("SECONDARY")
                  .setEmoji("💞"),
                  new MessageButton()
                  .setCustomId("vcomentarios")
                  .setStyle("SECONDARY")
                  .setEmoji("💬"),
                  new MessageButton()
                  .setCustomId("del")
                  .setStyle("SECONDARY")
                  .setEmoji("🗑️"),
              )] })
  
              inter.reply({content:`Você curtiu o post de ${user}`,ephemeral:true})
          } else {
              let u =   await db.get(`post_${inter.message.id}.author`)
              let user = client.users.cache.get(u)
              inter.reply({content:`Você já curtiu o post de ${user}`,ephemeral:true})   
          }
          
      } else   if(inter.customId == "vcurtidas") {
          let u =   await db.get(`post_${inter.message.id}.author`)
          let user = client.users.cache.get(u)
         let curtidas =     await db.get(`post_${inter.message.id}.curtidas`)
  
         if(curtidas.length < 1) return inter.reply({embeds:[new MessageEmbed()
          .setTitle(`Aqui está as Curtidas do post de ${user}`)
          .setColor("#e0b0ff")
          .setDescription(`Não há curtidas`)
      ],ephemeral	:true})
  
   let cur=   curtidas.map(val=> `> <@${val}>`).join("\n")
  
      return inter.reply({embeds:[new MessageEmbed()
          .setTitle(`Aqui está as Curtidas do post de ${user.username}`)
          .setColor("#e0b0ff")
          .setDescription(`${cur}`)
          .setFooter(`Total de curtidas: ${curtidas.length}`)
      ],ephemeral	:true})
          
      } else  if(inter.customId == "comentar") {
          const modal_data = new ModalBuilder()
          .setCustomId("comment")
          .setTitle("Comente no post!")
          .addComponents(
            new ModalField()
            .setLabel("Qual seu comentario?")
            .setStyle("short")
            .setPlaceholder("Coloque seu comentario")
            .setMax(100)
            .setCustomId("cc")
            .setRequired(true))
  
            client.modal.open(inter, modal_data) 
              
    
          
      }  else   if(inter.customId == "vcomentarios") {
          let u =   await db.get(`post_${inter.message.id}.author`)
          let user = client.users.cache.get(u)
         let Comentarios =     await db.get(`post_${inter.message.id}.comentarios`)
  
         if(Comentarios.length < 1) return inter.reply({embeds:[new MessageEmbed()
          .setTitle(`Aqui está os Comentarios do post de ${user.username}`)
          .setColor("#e0b0ff")
          .setDescription(`Não há Comentarios`)
      ],ephemeral	:true})
  
   let cur=   Comentarios.map(val=> `> <@${val.split("_")[0]}> : ${val.split("_")[1]}`).join("\n")
  
      return inter.reply({embeds:[new MessageEmbed()
          .setTitle(`Aqui está os Comentarios do post de ${user.username}`)
          .setColor("#e0b0ff")
          .setDescription(`${cur}`)
          .setFooter(`Total de Comentarios: ${Comentarios.length}`)
      ],ephemeral	:true})
          
      } else if(inter.customId=="del") {
          let u =   await db.get(`post_${inter.message.id}.author`)
  
          if(inter.user.id !== u) return inter.reply({content:"Esse post não é seu.",ephemeral:true})
          inter.message.delete()
          inter.reply({content:"Post apagado",ephemeral:true})   
      
      }
  })
  
  
  client.on("modalSubmitInteraction",async(interaction)=>{
      if(interaction.customId == 'comment'){
          console.log(interaction)
          let dbu = await db.get(`post_${interaction.data.message.id}_${interaction.user.id}.comentar`)
          if(!dbu) {
                      let u =   await db.get(`post_${interaction.data.message.id}.author`)
                      await db.push(`post_${interaction.data.message.id}.comentarios`,[`${interaction.user.id}_${interaction.fields.getTextInputValue("cc")}`])
                      await db.set(`post_${interaction.data.message.id}_${interaction.user.id}.comentar`,true)
                      let user = client.users.cache.get(u)
                      let comentarios = await db.get(`post_${interaction.data.message.id}.comentarios`)
                      let curtidas = await db.get(`post_${interaction.data.message.id}.curtidas`)
                      let web = await db.get(`instagram_${interaction.guild.id}.webhook`)
                      let webhook = new WebhookClient({url:web})
                      webhook.editMessage(interaction.data.message.id,{components: [  new MessageActionRow().addComponents(
                          new MessageButton()
                          .setCustomId("curtir")
                          .setLabel(`${curtidas.length}`)
                          .setStyle("SECONDARY")
                          .setEmoji("❤️"),
                          new MessageButton()
                          .setCustomId("comentar")
                          .setLabel(`${comentarios.length}`)
                          .setStyle("SECONDARY")
                          .setEmoji("💭"),
                          new MessageButton()
                          .setCustomId("vcurtidas")
                          .setStyle("SECONDARY")
                          .setEmoji("💞"),
                          new MessageButton()
                          .setCustomId("vcomentarios")
                          .setStyle("SECONDARY")
                          .setEmoji("💬"),
                          new MessageButton()
                          .setCustomId("del")
                          .setStyle("SECONDARY")
                          .setEmoji("🗑️"),
                      )] })
          
                      interaction.reply({content:`Você comentou no post de ${user}`,ephemeral:true})
                  } else {
                      let u =   await db.get(`post_${interaction.data.message.id}.author`)
                      let user = client.users.cache.get(u)
                      interaction.reply({content:`Você já comentou o post de ${user}`,ephemeral:true})   
                  }
      } 
     })


//------------------------------------------------------------[anti crach ]---------------------------------------------------------------//

process.on('multipleResolves', (type, reason, promise) => {
    console.log(`🚫 Erro Detectado\n\n` + type, promise, reason)
});
process.on('unhandRejection', (reason, promise) => {
    console.log(`🚫 Erro Detectado:\n\n` + reason, promise)
});
process.on('uncaughtException', (error, origin) => {
    console.log(`🚫 Erro Detectado:\n\n` + error, origin)
});
process.on('uncaughtExceptionMonitor', (error, origin) => {
    console.log(`🚫 Erro Detectado:\n\n` + error, origin)
})

/* Coded By: Suicidaram (Brunno)
  Api (A melhor 🙂): https://serenys.xyz/ By: Linn
  */
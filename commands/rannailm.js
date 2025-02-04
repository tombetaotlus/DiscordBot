const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { request } = require('undici');
const { DateTime } = require('luxon');

const flagMap = {
  yellow: '<:yellow:1101471020860313640>',
  red: '<:red:1101471038132465724>',
  green: '<:green:1101471005312024667>',
  purple: '<:purple:1105437530368778300>',
  Default: '<:grey:1105458610126987355>',
};
const getOneBeachDescription = (searchString, beaches) => {
  const rand = beaches.find((el) => el.name === searchString);

  return getBeachRow(rand);
};

const getBeachListDescription = (beaches) => {
  return beaches
    .filter((el) => el.name !== null)
    .map(getBeachRow)
    .join('\n');
};
const getBeachRow = (beach) => {
  const beachinfo = beach.forecast.beach[0];
  const date = DateTime.fromISO(beachinfo.dateTime)
    .setZone('Europe/Tallinn')
    .toFormat('dd.MM HH:mm');
  const flag = flagMap[beachinfo.flag] || flagMap.Default;
  if (beachinfo.temperature === null)
    return `${flag} **${beach.name}**: andmed puuduvad`;
  else {
    return ` ${flag} **${date} ${beach.name}** õhk: **${beachinfo.temperature} **°C vesi: **${beachinfo.waterTemperature} **°C  inimesi: **${beachinfo.crowd}** `;
  }
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rannailm')
    .setDescription('näitab veetemperatuure supelrandades')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('rand')
        .setDescription('vali üks rand')
        .addStringOption((option) =>
          option
            .setName('rand')
            .setDescription('sisesta ranna nimi')
            .setRequired(true)
            .addChoices(
              { name: 'Pirita rand', value: 'Pirita rand' },
              {
                name: 'Pelgurand / Stroomi rand',
                value: 'Pelgurand / Stroomi rand',
              },
              { name: 'Kakumäe rand', value: 'Kakumäe rand' },
              { name: 'Harku järv', value: 'Harku järv' },
              { name: 'Pikakari rand', value: 'Pikakari rand' },
              { name: 'Paralepa rand', value: 'Paralepa rand' },
              { name: 'Vasikaholmi rand', value: 'Vasikaholmi rand' },
              { name: 'Pärnu rand', value: 'Pärnu rand' },
              { name: 'Emajõe vabaujula', value: 'Emajõe vabaujula' },
              { name: 'Emajõe linnaujula', value: 'Emajõe linnaujula' },
              { name: 'Anne kanal', value: 'Anne kanal' },
              { name: 'Verevi järv', value: 'Verevi järv' },
              { name: 'Viljandi järv', value: 'Viljandi järv' },
              { name: 'Tõrva Riiska rand', value: 'Tõrva Riiska rand' },
              { name: 'Tõrva Vanamõisa rand', value: 'Tõrva Vanamõisa rand' },
              { name: 'Kuressaare rand', value: 'Kuressaare rand' },
              { name: 'Pühajärv', value: 'Pühajärv' },
              { name: 'Põlva paisjärv', value: 'Põlva paisjärv' },
            ),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand.setName('rannad').setDescription('näita kõiki randu'),
    ),

  async execute(interaction) {
    await interaction.deferReply();
    const result = await request(
      'https://services.postimees.ee/weather/v4/groups/beach/forecast?type=beach&language=et',
    );

    const beaches = await result.body.json();

    const subCommand = interaction.options.getSubcommand();
    const searchString = interaction.options.getString('rand');
    const description =
      subCommand === 'rand'
        ? getOneBeachDescription(searchString, beaches)
        : getBeachListDescription(beaches);

    const embed = new EmbedBuilder()
      .setColor(0x1abc9c)
      .setDescription(description);

    interaction.followUp({ embeds: [embed] });
  },
};

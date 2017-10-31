# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create(name: 'Luke', movie: movies.first)


(1..10).each do |i|


user = User.new(:email => "test.com",
:password => "aaaaaa")
user.save!

cu = CardUser.new(:name => "もげ",
:personalID => 15237055,
:mail => "test.com",
:phoneNumber => "08000001111",
:Balance => 999,
:Limit => "2018-03-30")

c = Card.new(:idm => "111018000d175902",
:registTimes => 1,
:Acctive => true,)

card_user.attrbutes[:card_id] = card
card_user.save!
card.attrbutes[:cardUser_id] =

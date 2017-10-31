class CreateCardUsers < ActiveRecord::Migration[5.1]
  def change
    create_table :card_users do |t|
      t.string :name
      t.integer :personalID
      t.string :mail
      t.string :phoneNumber
      t.integer :Balance
      t.date :Limit
      t.belongs_to :studio_user, index: true

      t.timestamps
    end
  end
end

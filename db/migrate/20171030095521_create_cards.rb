class CreateCards < ActiveRecord::Migration[5.1]
  def change
    create_table :cards do |t|
      t.string :idm
      t.integer :registTimes
      t.boolean :Acctive
      t.belongs_to :studio_user, index: true

      t.timestamps
    end
  end
end

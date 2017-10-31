class StudioUser < ApplicationRecord
  has_one :card_user, dependent: :destroy
  has_one :card, dependent: :destroy
end

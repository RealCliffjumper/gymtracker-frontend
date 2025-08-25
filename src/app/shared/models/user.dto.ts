export interface UserDto {
  userLoginId: string;
  userFirstName: string;
  userLastName: string;
  password: string;
  unitPreference: 'KG' | 'LBS'
}
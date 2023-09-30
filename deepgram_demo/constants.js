// Copyright 2023 Max Sprauer

const FACES = [
  "face_a_e_i_ee",
  "face_b_m_p",
  "face_ch_j_sh_g_k_c_d_n_s_t_x_y_z",
  "face_f_v",
  "face_l",
  "face_th",
  "face_u_o",
  "face_w_q",
];

const IMAGES = [...FACES, "face_happy", "face_thoughtful"];

const FACE_ONLOAD = "face_happy";
const FACE_START = "face_thoughtful";
const FACE_END_OF_WORD = "face_b_m_p";
const FACE_END = "face_thoughtful";
const FACE_DEFAULT_SOUND = "face_ch_j_sh_g_k_c_d_n_s_t_x_y_z";

const CANVAS_WIDTH = 117;
const CANVAS_HEIGHT = 152;

const FUDGE_SEC = -0.3;
